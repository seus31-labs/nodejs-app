'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('todos', 'is_recurring', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('todos', 'recurrence_pattern', {
      type: Sequelize.ENUM('daily', 'weekly', 'monthly'),
      allowNull: true,
    });

    await queryInterface.addColumn('todos', 'recurrence_interval', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    });

    await queryInterface.addColumn('todos', 'recurrence_end_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn('todos', 'original_todo_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addIndex('todos', ['is_recurring'], {
      name: 'idx_todos_is_recurring',
    });

    await queryInterface.addIndex('todos', ['original_todo_id'], {
      name: 'idx_todos_original_todo_id',
    });

    await queryInterface.addConstraint('todos', {
      fields: ['original_todo_id'],
      type: 'foreign key',
      name: 'fk_todos_original_todo_id',
      references: { table: 'todos', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('todos', 'fk_todos_original_todo_id');
    await queryInterface.removeIndex('todos', 'idx_todos_original_todo_id');
    await queryInterface.removeIndex('todos', 'idx_todos_is_recurring');
    await queryInterface.removeColumn('todos', 'original_todo_id');
    await queryInterface.removeColumn('todos', 'recurrence_end_date');
    await queryInterface.removeColumn('todos', 'recurrence_interval');
    await queryInterface.removeColumn('todos', 'recurrence_pattern');
    await queryInterface.removeColumn('todos', 'is_recurring');
  },
};

