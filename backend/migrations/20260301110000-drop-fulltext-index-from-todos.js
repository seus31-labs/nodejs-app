'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [rows] = await queryInterface.sequelize.query(
      `SELECT 1 AS found FROM information_schema.statistics
       WHERE table_schema = DATABASE() AND table_name = 'todos' AND index_name = 'fulltext_title_description' LIMIT 1`
    );
    if (rows && rows.length > 0) {
      await queryInterface.sequelize.query(
        'ALTER TABLE todos DROP INDEX fulltext_title_description'
      );
    }
  },

  async down() {
    // FULLTEXT は LIKE で使わないため down では復元しない
  },
};
