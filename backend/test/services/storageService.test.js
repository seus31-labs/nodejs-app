'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const storageService = require('../../services/StorageService')

test('sanitizeFileName: 空文字は file にフォールバックする', () => {
  assert.strictEqual(storageService.sanitizeFileName(''), 'file')
})

test('sanitizeFileName: 制御文字と危険文字を除去/置換する', () => {
  const sanitized = storageService.sanitizeFileName('\u0000evil:/name?.png')
  assert.strictEqual(sanitized, 'name_.png')
})

test('generateUniqueFileName: 許可拡張子は維持する', () => {
  const generated = storageService.generateUniqueFileName('photo.JPG')
  assert.match(generated, /^[0-9a-f-]{36}\.jpg$/)
})

test('generateUniqueFileName: 非許可拡張子は除去する', () => {
  const generated = storageService.generateUniqueFileName('script.sh')
  assert.match(generated, /^[0-9a-f-]{36}$/)
})

test('deleteFile: upload ルート外の絶対パスは削除せず false を返す', async () => {
  const deleted = await storageService.deleteFile('/etc/passwd')
  assert.strictEqual(deleted, false)
})
