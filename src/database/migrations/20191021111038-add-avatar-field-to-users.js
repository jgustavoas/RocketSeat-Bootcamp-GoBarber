module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'avatar_id', {
      type: Sequelize.INTEGER,
      // "reference" abaixo diz que essa nova coluna 'avatar_id' faz referência ao id da tabela 'files'
      reference: { model: 'files', key: 'id' },
      // Nas duas linhas abaixo se o arquivo for alterado, essa alteração se refletirá na tabela 'users'
      // Se for apagado a coluna terá valor NULL
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true, // já vem por padrão, mas aqui se enfatiza.
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('users', 'avatar_id');
  },
};
