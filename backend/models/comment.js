'use strict';

const { DataTypes } = require('sequelize');

/**
 * Todo に紐づくコメント（機能9）。作成者は userId、閲覧は共有の view / 作成は edit 以上。
 */
module.exports = (sequelize) => {
  const Comment = sequelize.define(
    'Comment',
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
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: 'comments',
      timestamps: true,
      underscored: true,
    }
  );

  Comment.associate = function (models) {
    Comment.belongsTo(models.Todo, { foreignKey: 'todoId' });
    Comment.belongsTo(models.User, { foreignKey: 'userId', as: 'Author' });
  };

  return Comment;
};
