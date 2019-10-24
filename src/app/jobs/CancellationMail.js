import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class CancellationMail {
  // Usando o recurso get é possível o usuário acessar uma determinada propriedade
  // sem precisar identificá-la exatamente, neste caso chamando apenas CancellationMail.key
  // Isso é útil para retornar variáveis de fácil acesso sem precisar criar um constructor
  get key() {
    // Chave única para cada job
    return 'CancellationMail';
  }

  // Criando um método para ser exucutado quando o job for designado
  async handle({ data }) {
    const { appointment } = data;

    console.log('A fila executou');

    // Enviar email após cancelamento
    await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'Agendamento cancelado',
      template: 'cancellation',
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(
          parseISO(appointment.date),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new CancellationMail();
