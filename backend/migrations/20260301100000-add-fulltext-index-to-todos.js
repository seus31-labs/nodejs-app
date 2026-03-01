'use strict';

/**
 * FULLTEXT は LIKE 検索では使われないため追加しない（LIKE 運用）。
 * 既に本マイグレーションを実行済みの環境は 20260301110000-drop-fulltext-index-from-todos で削除する。
 * @type {import('sequelize-cli').Migration} */
module.exports = {
  async up() {},
  async down() {},
};
