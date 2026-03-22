'use strict';

const { DataTypes } = require('sequelize');

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

module.exports = (sequelize) => {
  const Tag = sequelize.define(
    'Tag',
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
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      color: {
        type: DataTypes.STRING(7),
        allowNull: false,
        defaultValue: '#808080',
      },
    },
    {
      tableName: 'tags',
      timestamps: true,
      underscored: true,
      validate: {
        colorFormat() {
          if (this.color && !HEX_COLOR.test(this.color)) {
            throw new Error('color must be a valid hex (e.g. #808080)');
          }
        },
      },
    }
  );

  Tag.associate = function (models) {
    Tag.belongsTo(models.User, { foreignKey: 'userId' });
    Tag.belongsToMany(models.Todo, {
      through: models.TodoTag,
      foreignKey: 'tagId',
      otherKey: 'todoId',
      as: 'Todos',
    });
  };

  return Tag;
};
