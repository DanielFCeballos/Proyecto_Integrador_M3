import { createRouter } from './router.js';
import { homeView, chatView, aboutView, notFoundView } from './views.js';
import { mountChat } from './chat.js';
import { character } from './character.js';

document.querySelector('#educational-disclaimer').textContent = character.disclaimer;
document.querySelector('#simulation-mode').textContent = character.currentMode;
document.querySelector('#simulation-identification').textContent = character.identification;

createRouter({
  outlet: document.querySelector('#main-content'),
  routes: {
    '/home': { title: 'Inicio', view: homeView },
    '/chat': { title: 'Conversar', view: chatView, mount: mountChat },
    '/about': { title: 'El proyecto', view: aboutView },
  },
  notFound: { title: 'Destino no encontrado', view: notFoundView },
});
