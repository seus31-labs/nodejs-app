'use strict';

/** 6桁 HEX カラー（#RRGGBB）の正規表現。モデル・Service で共通利用するため単一定義。 */
const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

module.exports = { HEX_COLOR };
