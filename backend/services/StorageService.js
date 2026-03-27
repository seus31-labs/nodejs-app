'use strict'

const fs = require('node:fs/promises')
const fsSync = require('node:fs')
const path = require('node:path')
const { pipeline } = require('node:stream/promises')
const { randomUUID } = require('node:crypto')

const UPLOAD_URL_PREFIX = '/uploads'
const DEFAULT_UPLOAD_DIR = path.join(__dirname, '..', 'uploads')
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf'])

function parseTodoId(todoId) {
  const parsed = Number.parseInt(todoId, 10)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('todoId must be a positive integer')
  }
  return parsed
}

function sanitizeFileName(fileName) {
  const baseName = path.basename(String(fileName || ''))
  const normalized = baseName.normalize('NFKC')
  const sanitized = normalized
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .trim()

  return sanitized.length > 0 ? sanitized : 'file'
}

function getUploadRootDir() {
  const configured = process.env.ATTACHMENT_UPLOAD_DIR
  if (configured && configured.trim().length > 0) {
    return path.resolve(configured.trim())
  }
  return DEFAULT_UPLOAD_DIR
}

function toPublicFileUrl(todoId, uniqueFileName) {
  return `${UPLOAD_URL_PREFIX}/${todoId}/${uniqueFileName}`
}

function resolvePathFromFileUrl(fileUrl) {
  const uploadRoot = getUploadRootDir()
  if (!fileUrl || typeof fileUrl !== 'string') return null

  if (fileUrl.startsWith(UPLOAD_URL_PREFIX + '/')) {
    const relativePart = fileUrl.slice(UPLOAD_URL_PREFIX.length + 1)
    return path.resolve(uploadRoot, relativePart)
  }

  if (path.isAbsolute(fileUrl)) {
    return path.resolve(fileUrl)
  }

  return path.resolve(uploadRoot, fileUrl)
}

function isUnderUploadRoot(targetPath) {
  const uploadRoot = getUploadRootDir()
  const normalizedRoot = path.resolve(uploadRoot) + path.sep
  const normalizedTarget = path.resolve(targetPath)
  return normalizedTarget.startsWith(normalizedRoot)
}

function generateUniqueFileName(originalFileName) {
  const safeName = sanitizeFileName(originalFileName)
  const ext = path.extname(safeName).toLowerCase()
  const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : ''
  return `${randomUUID()}${safeExt}`
}

/**
 * @param {object} file - @fastify/multipart のファイルオブジェクト
 * 呼び出し前に MIME タイプ検証を行うこと（StorageService は保存処理に専念する）。
 * @param {number|string} todoId
 * @returns {Promise<{originalFileName: string, storedFileName: string, fileSize: number, mimeType: string, fileUrl: string}>}
 */
async function uploadFile(file, todoId) {
  const safeTodoId = parseTodoId(todoId)
  if (!file || typeof file !== 'object' || typeof file.file?.pipe !== 'function') {
    throw new Error('file stream is required')
  }

  const uploadRoot = getUploadRootDir()
  const todoUploadDir = path.join(uploadRoot, String(safeTodoId))
  const originalFileName = sanitizeFileName(file.filename)
  const uniqueFileName = generateUniqueFileName(originalFileName)
  const targetPath = path.join(todoUploadDir, uniqueFileName)

  await fs.mkdir(todoUploadDir, { recursive: true })
  await pipeline(file.file, fsSync.createWriteStream(targetPath))

  const stat = await fs.stat(targetPath)
  return {
    originalFileName,
    storedFileName: uniqueFileName,
    fileSize: stat.size,
    mimeType: file.mimetype || 'application/octet-stream',
    fileUrl: toPublicFileUrl(safeTodoId, uniqueFileName)
  }
}

async function deleteFile(fileUrl) {
  const targetPath = resolvePathFromFileUrl(fileUrl)
  if (!targetPath) return false
  if (!isUnderUploadRoot(targetPath)) return false

  try {
    await fs.unlink(targetPath)
    return true
  } catch (error) {
    if (error && error.code === 'ENOENT') return false
    throw error
  }
}

module.exports = {
  sanitizeFileName,
  generateUniqueFileName,
  uploadFile,
  deleteFile
}
