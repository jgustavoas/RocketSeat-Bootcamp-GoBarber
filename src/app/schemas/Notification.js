import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    /**
     * Definindo os campos do schema ("tabela") no banco de dados "NotificationSchema"
     * Observar que são usados os primitivos do JS para indicar o tipo dos campos
     * ao invés de TEXT, INTEGER etc natural dos db en SQL
     * */
    content: {
      type: String,
      required: true,
    },
    user: {
      type: Number,
      required: true,
    },
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true, // isso configura o db a incluir createdAt e updatedAt
  }
);

// Modela o schema ("tabela") batizando-a com o nome "Notification"...
// ...usando a estrutura definida em "NotificationSchema":
export default mongoose.model('Notification', NotificationSchema);
