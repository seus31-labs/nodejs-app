'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // 既存行を createdAt 順で連番化（初回マイグレーション適用後の環境向け）
    await queryInterface.sequelize.query(`
      UPDATE todos t
      INNER JOIN (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) - 1 AS rn
        FROM todos
      ) s ON t.id = s.id
      SET t.sort_order = s.rn
    `);
  },

  async down() {
    // データロールバックは行わない（sort_order を 0 に戻すだけの価値は低い）
  }
};
