'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('todo_tags', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      todo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'todos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tag_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tags', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
    await queryInterface.addIndex('todo_tags', ['todo_id']);
    await queryInterface.addIndex('todo_tags', ['tag_id']);
    await queryInterface.addIndex('todo_tags', ['todo_id', 'tag_id'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('todo_tags');
  },
};
