'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('todos', 'archived', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('todos', 'archived_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addIndex('todos', ['archived']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('todos', ['archived']);
    await queryInterface.removeColumn('todos', 'archived_at');
    await queryInterface.removeColumn('todos', 'archived');
  }
};
