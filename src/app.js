import express, { json } from 'express';
import path from 'path';
import routes from './routes';

import './database';

class App {
  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  // rotas também funcionam como middlewares e por isso podem ser chamadas dentro de "this.server.use"
  routes() {
    this.server.use(routes);
  }
}

// necessário apenas exportar "server" da classe App
export default new App().server;
