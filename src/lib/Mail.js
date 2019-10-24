import nodemailer from 'nodemailer';
import { resolve } from 'path';
import expressHandlebars from 'express-handlebars';
import nodemailerExHandlebars from 'nodemailer-express-handlebars';
import mailConfig from '../config/mail';

class Mail {
  constructor() {
    // Desestruturando mailCOnfig para criar uma lógica para auth
    const { host, port, secure, auth } = mailConfig;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      // Criando o condicional abaixo porque alguns envios de email não pedem autenticação
      auth: auth.user ? auth : null,
    });

    this.configureTemplate();
  }

  configureTemplate() {
    const viewPath = resolve(__dirname, '..', 'app', 'views', 'emails');

    this.transporter.use(
      'compile',
      nodemailerExHandlebars({
        viewEngine: expressHandlebars.create({
          layoutsDir: resolve(viewPath, 'layouts'),
          partialsDir: resolve(viewPath, 'partials'),
          defaultLayout: 'default',
          extname: '.hbs',
        }),
        viewPath,
        extName: '.hbs',
      })
    );
  }

  // Criando um novo método ao invés de usar o return no constructor...
  // para personalizar o email com itens configurados por padrão (mailConfig.defaulr)...
  // tal como o nome do remetente
  sendMail(message) {
    return this.transporter.sendMail({
      ...mailConfig.default,
      ...message,
    });
  }
}

export default new Mail();
