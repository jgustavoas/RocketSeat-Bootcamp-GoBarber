import Sequelize from 'sequelize';
import mongoose from 'mongoose';

import User from '../app/models/User';
import File from '../app/models/File';
import Appointment from '../app/models/Appointment';

import databaseConfig from '../config/database';

const models = [User, File, Appointment];

class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
    // A linha acima executa a associação somente nos models que têm o método associate()
  }

  mongo() {
    this.mongoConnection = mongoose.connect(
      process.env.MONGO_URL,
      {
        useNewUrlParser: true,
        useFindAndModify: true,
        useUnifiedTopology: true,
      }
      /**
       * Motivo de usar o terceiro parâmetro acima, não mecionado pelo Diego:
       * (node:5005) DeprecationWarning: current Server Discovery and Monitoring engine is deprecated,
       * and will be removed in a future version. To use the new Server Discover and Monitoring engine,
       * pass option { useUnifiedTopology: true } to the MongoClient constructor.
       */
    );
  }
}

export default new Database();
