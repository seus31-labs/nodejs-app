'use strict';

/** @type {import('sequelize-cli').Migration} */
function isMissingDbObjectError(error) {
  const message = String(error && error.message ? error.message : error);
  return (
    message.includes('does not exist') ||
    message.includes("check that column/key exists") ||
    message.includes("Can't DROP")
  );
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('todos', 'parent_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addIndex('todos', ['parent_id'], {
      name: 'idx_todos_parent_id',
    });

    // 自己参照 FK は addColumn の references と同時定義より分離した方が
    // MySQL での適用失敗を避けやすいため addConstraint で追加する。
    await queryInterface.addConstraint('todos', {
      fields: ['parent_id'],
      type: 'foreign key',
      name: 'fk_todos_parent_id',
      references: { table: 'todos', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface) {
    try {
      await queryInterface.removeConstraint('todos', 'fk_todos_parent_id');
    } catch (error) {
      if (!isMissingDbObjectError(error)) {
        throw error;
      }
    }

    try {
      await queryInterface.removeIndex('todos', 'idx_todos_parent_id');
    } catch (error) {
      if (!isMissingDbObjectError(error)) {
        throw error;
      }
      try {
        // 旧版マイグレーションが自動命名したインデックス向けフォールバック。
        await queryInterface.removeIndex('todos', ['parent_id']);
      } catch (fallbackError) {
        if (!isMissingDbObjectError(fallbackError)) {
          throw fallbackError;
        }
      }
    }

    try {
      await queryInterface.removeColumn('todos', 'parent_id');
    } catch (error) {
      if (!isMissingDbObjectError(error)) {
        throw error;
      }
    }
  },
};
