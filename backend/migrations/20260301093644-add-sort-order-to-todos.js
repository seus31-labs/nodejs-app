'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('todos', 'sort_order', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addIndex('todos', ['sort_order']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('todos', ['sort_order']);
    await queryInterface.removeColumn('todos', 'sort_order');
  }
};
