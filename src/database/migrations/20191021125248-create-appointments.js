module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('appointments', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        // Indicando o relacionamento com a tabela "users"
        reference: { model: 'users', key: 'id' },
        // Nas duas linhas abaixo se o arquivo for alterado, essa alteração se refletirá na tabela 'users'
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true, // já vem por padrão, mas aqui se enfatiza.
      },
      provider_id: {
        type: Sequelize.INTEGER,
        // Indicando o relacionamento com a tabela "users"
        reference: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      canceled_at: {
        type: Sequelize.DATE,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('appointments');
  },
};
