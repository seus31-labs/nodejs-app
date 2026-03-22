'use strict';

const { DataTypes } = require('sequelize');

/**
 * Todo モデル
 * ユーザーごとの Todo 管理。JWT 認証と連携し、userId でスコープする。
 */
module.exports = (sequelize) => {
  const Todo = sequelize.define(
    'Todo',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium',
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'due_date',
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'sort_order',
      },
      archived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      archivedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'archived_at',
      },
      reminderEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'reminder_enabled',
      },
      reminderSentAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reminder_sent_at',
      },
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'project_id',
        references: { model: 'projects', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    },
    {
      tableName: 'todos',
      timestamps: true,
      underscored: true,
    }
  );

  Todo.associate = function (models) {
    Todo.belongsTo(models.User, { foreignKey: 'userId' });
    Todo.belongsTo(models.Project, { foreignKey: 'projectId' });
    Todo.belongsToMany(models.Tag, {
      through: models.TodoTag,
      foreignKey: 'todoId',
      otherKey: 'tagId',
      as: 'Tags',
    });
    Todo.hasMany(models.TodoShare, { foreignKey: 'todoId' });
  };

  return Todo;
};
