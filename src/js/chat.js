import { character } from './character.js';
import { requestChatReply } from './chat-api.js';
import { validateHistory } from './chat-policy.js';

const messages = [{ role: 'character', text: character.greeting, sourceIds: [] }];
const completedTurns = [];
const subscribers = new Set();
let activeRequest = null;
let lastError = '';
let failedMessage = null;
let draft = '';

const notify = () => subscribers.forEach(update => update());

export function buildHistory(turns) {
  return validateHistory(turns.flatMap(turn => [{ role: 'user', text: turn.user }, { role: 'model', text: turn.model }]));
}

async function sendMessage(text, retryMessage = null) {
  const value = text.trim();
  if (!value || value.length > 1000 || activeRequest) return;
  const userMessage = retryMessage || { role: 'user', text: value };
  if (!retryMessage) messages.push(userMessage);
  const request = { controller: new AbortController(), timedOut: false };
  activeRequest = request;
  lastError = '';
  failedMessage = null;
  if (!retryMessage) draft = '';
  notify();
  const timeout = window.setTimeout(() => { request.timedOut = true; request.controller.abort(); }, 25000);
  try {
    const data = await requestChatReply({
      message: value,
      history: buildHistory(completedTurns),
      signal: request.controller.signal,
    });
    // Reset invalidates this request even if the network ignores cancellation.
    if (activeRequest !== request) return;
    const validSources = data.sourceIds.filter(id => character.sources.some(source => source.id === id));
    messages.push({ role: 'character', text: data.reply.trim(), sourceIds: [...new Set(validSources)] });
    completedTurns.push({ user: value, model: data.reply.trim() });
  } catch (error) {
    if (activeRequest !== request) return;
    lastError = request.timedOut ? 'La consulta tardó demasiado. Puedes reintentar.' : error.name === 'AbortError' ? 'La consulta se canceló.' : error instanceof TypeError ? 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.' : error.message;
    failedMessage = userMessage;
  } finally {
    window.clearTimeout(timeout);
    if (activeRequest === request) { activeRequest = null; notify(); }
  }
}

function resetConversation() {
  const previous = activeRequest;
  activeRequest = null;
  previous?.controller.abort();
  messages.splice(0, messages.length, { role: 'character', text: character.greeting, sourceIds: [] });
  completedTurns.length = 0;
  lastError = '';
  failedMessage = null;
  draft = '';
  notify();
}

export function mountChat() {
  const log = document.querySelector('#messages');
  const form = document.querySelector('#chat-form');
  const input = document.querySelector('#message-input');
  const status = document.querySelector('#chat-status');
  const sendButton = form.querySelector('button');
  const count = document.querySelector('#character-count');
  const errorBox = document.querySelector('#chat-error');
  const errorText = document.querySelector('#chat-error-text');
  const retryButton = document.querySelector('#retry-message');
  const suggestionButtons = document.querySelectorAll('[data-prompt]');
  const events = new AbortController();
  const options = { signal: events.signal };
  let rendered = 0;

  function appendMessage(message) {
    const article = document.createElement('article');
    article.className = `message message-${message.role}`;
    if (message.role === 'character') {
      const avatar = document.createElement('img');
      avatar.className = 'message-avatar';
      avatar.src = '/assets/deadpool-avatar.svg';
      avatar.alt = '';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.width = 32;
      avatar.height = 32;
      article.append(avatar);
    }
    const author = document.createElement('span');
    author.className = 'message-author';
    author.textContent = message.role === 'user' ? 'Tú' : character.assistantLabel;
    const body = document.createElement('p');
    body.textContent = message.text;
    article.append(author, body);
    if (message.sourceIds?.length) {
      const references = document.createElement('div');
      references.className = 'message-sources';
      references.append('Referencias sugeridas por IA (contrástalas): ');
      message.sourceIds.forEach(id => {
        const source = character.sources.find(item => item.id === id);
        const link = document.createElement('a');
        link.href = source.url;
        link.textContent = source.title;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        references.append(link);
      });
      article.append(references);
    }
    log.append(article);
    log.scrollTop = log.scrollHeight;
  }

  function updateComposer() {
    count.textContent = `${input.value.length} / 1000`;
    sendButton.disabled = Boolean(activeRequest) || !input.value.trim();
    suggestionButtons.forEach(button => { button.disabled = Boolean(activeRequest); });
  }

  function renderState() {
    if (rendered > messages.length) { log.replaceChildren(); rendered = 0; }
    messages.slice(rendered).forEach(appendMessage);
    rendered = messages.length;
    input.value = draft;
    status.textContent = activeRequest ? 'Gemini está generando una respuesta…' : '';
    log.setAttribute('aria-busy', String(Boolean(activeRequest)));
    errorBox.hidden = !lastError;
    errorText.textContent = lastError;
    retryButton.disabled = Boolean(activeRequest) || !failedMessage;
    updateComposer();
  }

  function submitDraft() {
    void sendMessage(input.value);
    input.focus();
  }
  subscribers.add(renderState);
  renderState();
  input.addEventListener('input', () => { draft = input.value; updateComposer(); }, options);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); submitDraft(); }
  }, options);
  form.addEventListener('submit', event => { event.preventDefault(); submitDraft(); }, options);
  suggestionButtons.forEach(button => button.addEventListener('click', () => { void sendMessage(button.dataset.prompt); input.focus(); }, options));
  retryButton.addEventListener('click', () => { if (failedMessage) void sendMessage(failedMessage.text, failedMessage); }, options);
  document.querySelector('#reset-chat').addEventListener('click', () => {
    rendered = 0;
    log.replaceChildren();
    resetConversation();
    status.textContent = 'Conversación reiniciada.';
    input.focus();
  }, options);
  // Navigation releases DOM listeners but does not duplicate or restart requests.
  return () => { subscribers.delete(renderState); events.abort(); };
}
