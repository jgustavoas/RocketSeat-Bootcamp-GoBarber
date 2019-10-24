import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize'; // Uso de operadores como "AND", "OR" "BETWEEN" etc

import User from '../models/User';
import Appointment from '../models/Appointment';

class ScheduleController {
  async index(req, res) {
    const checarPrestador = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checarPrestador) {
      return res.status(401).json({ erro: 'Usuário não é um prestador' });
    }

    const { date } = req.query;
    const parseDate = parseISO(date);

    const appointment = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          /**
           * Como "Op.between" é uma variável e estamos definindo-a como nome de propriedade de objeto,
           * é necessário estar dentro de colchetes
           */
          [Op.between]: [startOfDay(parseDate), endOfDay(parseDate)],
        },
      },
      order: ['date'],
    });

    return res.json(appointment);
  }
}

export default new ScheduleController();
