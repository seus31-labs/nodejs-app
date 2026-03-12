'use strict';

const { DataTypes } = require('sequelize');

/**
 * Todo 共有（11.1）。
 * todo_shares: id, todoId, sharedWithUserId, permission (view|edit), createdAt
 */
module.exports = (sequelize) => {
  const TodoShare = sequelize.define(
    'TodoShare',
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
      sharedWithUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'shared_with_user_id',
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      permission: {
        type: DataTypes.ENUM('view', 'edit'),
        allowNull: false,
      },
    },
    {
      tableName: 'todo_shares',
      timestamps: true,
      updatedAt: false,
      underscored: true,
    }
  );

  TodoShare.associate = function (models) {
    TodoShare.belongsTo(models.Todo, { foreignKey: 'todoId' });
    TodoShare.belongsTo(models.User, { foreignKey: 'sharedWithUserId' });
  };

  return TodoShare;
};
