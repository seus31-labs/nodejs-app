---
name: API仕様書
about: API仕様書を作成する
title: "[API] "
labels: ["API", "backend"]
assignees: 
---

## endpoints

`/api/v1/users`

## method

`GET`

## request parameters

| 論理名 | 物理名 | 型 | デフォルト |  必須 | 備考 |
| --- | --- | --- | --- | --- | --- |
| ページ数 | page | integer | 1 |  |  |
| 件数 | per_page | integer | 10 |  |  |

