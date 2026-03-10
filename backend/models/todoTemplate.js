'use strict';

const { DataTypes } = require('sequelize');

/**
 * TodoTemplate モデル
 * ユーザーが保存する Todo のひな形。テンプレートから Todo を生成できる。
 */
module.exports = (sequelize) => {
  const TodoTemplate = sequelize.define(
    'TodoTemplate',
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
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium',
      },
      tagIds: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'tag_ids',
      },
    },
    {
      tableName: 'todo_templates',
      timestamps: true,
      underscored: true,
    }
  );

  TodoTemplate.associate = function (models) {
    TodoTemplate.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return TodoTemplate;
};
