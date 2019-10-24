import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não enviado/fornecido' });
  }

  // Como o token através do header vem com a palavra "Bearer" antes dele, usa-se a função split()
  // Como o split gera uma array e o token está no segundo item, pode-se usar destrturação
  // Dica: como o primeiro item ("Bearer") desse array não interessa aqui, pode-se omitir a sua variável
  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    // console.log(decoded);

    // Incluindo a id do usuário na requisição. Note que é a req, não a res.
    // Isso para poder passar a id do usuário JÁ LOGADO pelo middleware de autenticação ao invés de pela URL
    req.userId = decoded.id;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
