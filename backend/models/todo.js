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
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'parent_id',
        references: { model: 'todos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      isRecurring: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_recurring',
      },
      recurrencePattern: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly'),
        allowNull: true,
        field: 'recurrence_pattern',
      },
      recurrenceInterval: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        field: 'recurrence_interval',
      },
      recurrenceEndDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'recurrence_end_date',
      },
      originalTodoId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'original_todo_id',
        references: { model: 'todos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    },
    {
      tableName: 'todos',
      timestamps: true,
      underscored: true,
      validate: {
        recurrenceConsistency() {
          if (!this.isRecurring) {
            return;
          }

          if (!this.recurrencePattern) {
            throw new Error('繰り返し設定には recurrencePattern が必要です。');
          }

          if (!Number.isInteger(this.recurrenceInterval) || this.recurrenceInterval < 1) {
            throw new Error('recurrenceInterval は 1 以上の整数である必要があります。');
          }
        },
        async hasNoCircularParentReference() {
          if (!this.parentId || !this.id) {
            return;
          }

          if (!this.changed('parentId')) {
            return;
          }

          if (this.parentId === this.id) {
            throw new Error('親Todoに自分自身は指定できません。');
          }

          const seenTodoIds = new Set([this.id]);
          const TodoModel = this.sequelize.models.Todo;
          let currentParentId = this.parentId;

          while (currentParentId) {
            if (seenTodoIds.has(currentParentId)) {
              throw new Error('親子関係が循環するため保存できません。');
            }

            seenTodoIds.add(currentParentId);
            const parentTodo = await TodoModel.findByPk(currentParentId, {
              attributes: ['id', 'parentId'],
            });

            if (!parentTodo) {
              break;
            }

            currentParentId = parentTodo.parentId;
          }
        },
      },
    }
  );

  Todo.associate = function (models) {
    Todo.belongsTo(models.User, { foreignKey: 'userId' });
    Todo.belongsTo(models.Project, { foreignKey: 'projectId' });
    Todo.belongsTo(models.Todo, {
      foreignKey: 'parentId',
      as: 'parent',
    });
    Todo.hasMany(models.Todo, {
      foreignKey: 'parentId',
      as: 'subtasks',
    });
    Todo.belongsTo(models.Todo, {
      foreignKey: 'originalTodoId',
      as: 'originalTodo',
    });
    Todo.hasMany(models.Todo, {
      foreignKey: 'originalTodoId',
      as: 'recurrences',
    });
    Todo.belongsToMany(models.Tag, {
      through: models.TodoTag,
      foreignKey: 'todoId',
      otherKey: 'tagId',
      as: 'Tags',
    });
    Todo.hasMany(models.TodoShare, { foreignKey: 'todoId' });
    Todo.hasMany(models.Comment, { foreignKey: 'todoId' });
  };

  return Todo;
};
