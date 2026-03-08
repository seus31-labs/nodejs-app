'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('todos', 'project_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'projects', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addIndex('todos', ['project_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('todos', ['project_id']);
    await queryInterface.removeColumn('todos', 'project_id');
  },
};
