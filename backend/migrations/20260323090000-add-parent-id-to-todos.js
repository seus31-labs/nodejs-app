'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('todos', 'parent_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addIndex('todos', ['parent_id']);

    await queryInterface.addConstraint('todos', {
      fields: ['parent_id'],
      type: 'foreign key',
      name: 'fk_todos_parent_id',
      references: { table: 'todos', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('todos', 'fk_todos_parent_id');
    await queryInterface.removeIndex('todos', ['parent_id']);
    await queryInterface.removeColumn('todos', 'parent_id');
  },
};
