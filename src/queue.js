import 'dotenv/config';

import Queue from './lib/Queue';

Queue.processQueue();

// Com esse simples arquivo é possível rodar a fila numa execução que não é a mesma de toda a aplicação
// Funcionando separada, a fila nunca irá influenciar a perfomance do restante aplicação.
// Ou seja, é possível rodar a aplicação e a fila em terminais diferentes.
