// Usa-se o formato abaixo porque esse pacote chamado Yup não possui "export default"
// O asterisco significa que vai ser importado tudo do pacote e colocado na variável
// O pacote Yup é usado para validação
import * as Yup from 'yup';

import User from '../models/User';

class UserController {
  async store(req, res) {
    // Usando o Yup para validar
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Não validado' });
    }
    // fim da validação

    const usuarioExistePorEmail = await User.findOne({
      where: { email: req.body.email },
    });

    if (usuarioExistePorEmail) {
      return res
        .status(400)
        .json({ error: 'Usuário com esse e-mail já existe!' });
    }

    const { id, name, email, provider } = await User.create(req.body);

    return res.json({ id, name, email, provider });
  }

  async update(req, res) {
    // Usando o Yup para validar
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Não validado' });
    }
    // fim da validação

    const { email, oldPassword } = req.body;

    // Procurando o usuário com a id obtida na requisição
    // findByPk significa procurar pela Primary Key, neste caso a id do usuário
    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      const usuarioExistePorEmail = await User.findOne({
        where: { email },
      });

      if (usuarioExistePorEmail) {
        return res
          .status(400)
          .json({ error: 'Usuário com esse e-mail já existe!' });
      }
    }

    if (oldPassword && !(await user.checarSenha(oldPassword))) {
      return res.status(401).json({ error: 'Senha não confere!' });
    }

    const { id, name, provider } = await user.update(req.body);

    return res.json({ id, name, email, provider });
  }
}

export default new UserController();
