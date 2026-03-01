'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('todos', 'sort_order', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addIndex('todos', ['sort_order']);
    // 既存行を createdAt 順で連番化（sort_order 同値での未定義順を防ぐ）
    await queryInterface.sequelize.query(`
      UPDATE todos t
      INNER JOIN (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) - 1 AS rn
        FROM todos
      ) s ON t.id = s.id
      SET t.sort_order = s.rn
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('todos', ['sort_order']);
    await queryInterface.removeColumn('todos', 'sort_order');
  }
};
