import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';

// import Mail from '../../lib/Mail'; ao invés de importar Mail, importa-se agora a queue

import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

class AppointmentController {
  async index(req, res) {
    // abaixo significa que se não for obtido o número da página pela URL, esse número = 1
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date'],
      limit: 20,
      /**
       * "offset" no código a seguir indica quantos registros pular na exibição
       * ou seja, se o usuário estiver na página 1, pela fórmula não pulará nenhum registro
       * se estiver na página 3, a listagem pulará os 40 primeiros registros
       */
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: {
            model: File,
            as: 'avatar',
            attributes: ['id', 'path', 'url'],
          },
        },
      ],
    });

    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Não passou pela validação' });
    }

    const { provider_id, date } = req.body;

    /**
     * Consultar o model User para localizar um usuário cuja id = provider_id da req.body
     * e que seja provider no banco de dados (true)
     */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res.status(401).json({
        error: 'Só é possível criar agendamentos com fornecedores do serviço.',
      });
    }

    // Chegagem de datas (detalhe: hourStart arredonda para a hora em ponto)
    // 1) Impedir inserção de datas no passado
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res
        .status(400)
        .json({ erro: 'Datas no passado não são permitidas.' });
    }

    // 2) Conferir disponibilidade do prestador de serviço
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      return res.status(400).json({ erro: 'Data indisponível' });
    }

    const agendamento = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart,
    });

    /**
     * Notificar prestador de serviço
     */
    const prestador = await User.findByPk(req.userId);
    const dataFormatada = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );

    await Notification.create({
      // Note que não é convecionado no MongoDB não usar variáveis dinâmicas que mudariam o conteúdo da mensagem quando fosse alteradas
      content: `Novo agendamento de ${prestador.name} para o ${dataFormatada}`,
      user: provider_id,
    });

    return res.json(agendamento);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        erro: 'Você não tem permissão para cancelar este agendamento.',
      });
    }

    const subtrairHora = subHours(appointment.date, 2);

    /**
     * Exemplo para o método abaixo:
     * Hora agendada: 13:00
     * Subtrair duas horas = 11:00
     * Hora atual: 11:25
     * Se a hora subtraída estiver antes da hora atual, não é possível cancelar
     */
    if (isBefore(subtrairHora, new Date())) {
      return res.status(401).json({
        erro:
          'Você só pode cancelar agendamento com duas horas de antecedência!',
      });
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    await Queue.add(CancellationMail.key, { appointment });

    return res.json(appointment);
  }
}

export default new AppointmentController();
