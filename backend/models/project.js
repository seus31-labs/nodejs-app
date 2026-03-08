'use strict';

const { DataTypes } = require('sequelize');

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

/**
 * Project モデル
 * ユーザーごとのプロジェクト（Todo のグループ）。Todo は任意で 1 プロジェクトに属する。
 */
module.exports = (sequelize) => {
  const Project = sequelize.define(
    'Project',
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      color: {
        type: DataTypes.STRING(7),
        allowNull: false,
        defaultValue: '#808080',
      },
      archived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: 'projects',
      timestamps: true,
      underscored: true,
      validate: {
        colorFormat() {
          if (!HEX_COLOR.test(this.color)) {
            throw new Error('color must be a valid hex (e.g. #808080)');
          }
        },
      },
    }
  );

  Project.associate = function (models) {
    Project.belongsTo(models.User, { foreignKey: 'userId' });
    Project.hasMany(models.Todo, { foreignKey: 'projectId' });
  };

  return Project;
};
