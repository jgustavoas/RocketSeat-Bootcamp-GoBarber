import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';

export default {
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    filename: (req, file, callback) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return callback(err);

        // O callback recebe como primeiro parâmetro um erro
        // como o código passou pela condição de erro na linha anterior coloca-se null no callback a seguir
        // Em seguida, converter o cyrypto.randomBytes (res) em uma string de conteúdo hexadecimal.
        return callback(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
