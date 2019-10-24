import User from '../models/User';
import Notification from '../schemas/Notification';

class NotificationController {
  async index(req, res) {
    /**
     * Consultar o model User para localizar um usuário cuja id = provider_id da req.body
     * e que seja provider no banco de dados (true)
     */
    const isProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!isProvider) {
      return res.status(401).json({
        error: 'Apenas prestadores do serviço podem listar notificações',
      });
    }

    // No mongoDB a parte de ordenação, limites de exibição etc. dos resultados é feita...
    // ...com uma sequência de métodos encadeados ("chaining") por pontos.
    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(notifications);
  }

  async update(req, res) {
    // const notification = await Notification.findById(req.params.id);

    /**
     * Com o método findByIdAndUpdate, basta encontrar o registro e atualizar o valor indicado.
     * Neste caso, estamos dizendo que a mensagem foi lida (read: true)
     * Além disse, dizemos para o db nos retornar o registro já com o campo atualizado.
     *  */
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    return res.json(notification);
  }
}

export default new NotificationController();
