'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TodoTag = sequelize.define(
    'TodoTag',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      todoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'todo_id',
        references: { model: 'todos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tagId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'tag_id',
        references: { model: 'tags', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'todo_tags',
      timestamps: true,
      updatedAt: false,
      underscored: true,
    }
  );

  TodoTag.associate = function (models) {
    TodoTag.belongsTo(models.Todo, { foreignKey: 'todoId' });
    TodoTag.belongsTo(models.Tag, { foreignKey: 'tagId' });
  };

  return TodoTag;
};
