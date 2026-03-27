'use strict';

const { DataTypes } = require('sequelize');

/**
 * Todo に紐づく添付ファイル（機能8）。
 * 実ファイルの格納先は fileUrl で抽象化し、ローカル/S3 切替に備える。
 */
module.exports = (sequelize) => {
  const Attachment = sequelize.define(
    'Attachment',
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
      fileName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'file_name',
      },
      fileSize: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'file_size',
      },
      mimeType: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'mime_type',
      },
      fileUrl: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'file_url',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
      },
    },
    {
      tableName: 'attachments',
      underscored: true,
      timestamps: true,
      updatedAt: false,
    }
  );

  Attachment.associate = function (models) {
    Attachment.belongsTo(models.Todo, { foreignKey: 'todoId' });
  };

  return Attachment;
};

