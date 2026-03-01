'use strict';

/**
 * 【no-op マイグレーション】ファイル名は履歴維持のため変更していません。
 *
 * 経緯: 当初 FULLTEXT インデックスを追加していたが、検索は Op.like (LIKE) を使用しており、
 * FULLTEXT は MATCH ... AGAINST でしか使われず、LIKE ではフルテーブルスキャンになるため
 * インデックスを廃止し LIKE 運用に統一。up/down は空のままにし、新規環境ではインデックスを追加しない。
 * 既に本マイグレーションを実行済みの環境は 20260301110000-drop-fulltext-index-from-todos で削除する。
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up() {},
  async down() {},
};
