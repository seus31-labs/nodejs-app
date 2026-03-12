import { Injectable } from '@angular/core'
import { IndexedDbService } from './indexed-db.service'
import type { Todo } from '../models/todo.interface'

const DB_NAME = 'app-offline'
const DB_VERSION = 1
const STORE_TODOS = 'todos'

/**
 * オフライン用の Todo キャッシュを IndexedDB で保持するサービス。
 * 20.6 でオフライン時の保存、20.7 でオンライン復帰時の同期に利用する。
 */
@Injectable({
  providedIn: 'root'
})
export class OfflineStorageService {
  private initPromise: Promise<void> | null = null

  constructor(private indexedDb: IndexedDbService) {}

  /** DB を開く（初回のみ。同一 DB なら再利用） */
  private async ensureOpen(): Promise<void> {
    if (this.initPromise) return this.initPromise
    this.initPromise = this.indexedDb.open(DB_NAME, DB_VERSION, [
      { name: STORE_TODOS, keyPath: 'id', indexes: [{ name: 'byId', keyPath: 'id', unique: true }] }
    ])
    return this.initPromise
  }

  /** キャッシュした Todo 一覧を取得 */
  async getTodos(): Promise<Todo[]> {
    await this.ensureOpen()
    return this.indexedDb.getAll<Todo>(STORE_TODOS)
  }

  /** Todo 一覧をキャッシュに保存（既存を上書き） */
  async saveTodos(todos: Todo[]): Promise<void> {
    await this.ensureOpen()
    await this.indexedDb.clear(STORE_TODOS)
    for (const todo of todos) {
      await this.indexedDb.put(STORE_TODOS, todo)
    }
  }

  /** Todo キャッシュを空にする */
  async clearTodos(): Promise<void> {
    await this.ensureOpen()
    await this.indexedDb.clear(STORE_TODOS)
  }
}
