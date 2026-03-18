'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('todos', 'reminder_enabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
    await queryInterface.addColumn('todos', 'reminder_sent_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addIndex('todos', ['reminder_enabled']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('todos', ['reminder_enabled']);
    await queryInterface.removeColumn('todos', 'reminder_sent_at');
    await queryInterface.removeColumn('todos', 'reminder_enabled');
  }
};

