'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE todos ADD FULLTEXT INDEX fulltext_title_description (title, description)'
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE todos DROP INDEX fulltext_title_description'
    );
  },
};
