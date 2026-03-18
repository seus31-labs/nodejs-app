import { Injectable } from '@angular/core'
import { BehaviorSubject, Subscription, timer, of } from 'rxjs'
import { switchMap, catchError } from 'rxjs/operators'
import { TodoService } from './todo.service'
import { NotificationService } from './notification.service'
import type { Todo } from '../models/todo.interface'

@Injectable({ providedIn: 'root' })
export class ReminderService {
  private sub?: Subscription
  private readonly intervalMs = 5 * 60 * 1000
  private readonly notifiedKey = 'todo.reminder.notified.v1'

  readonly running$ = new BehaviorSubject<boolean>(false)

  constructor(
    private todoService: TodoService,
    private notificationService: NotificationService
  ) {}

  start(): void {
    if (this.sub) return
    this.running$.next(true)

    this.sub = timer(0, this.intervalMs)
      .pipe(
        switchMap(() =>
          this.todoService.getDueSoonTodos().pipe(
            catchError(() => of([] as Todo[]))
          )
        )
      )
      .subscribe((todos) => this.handleDueSoon(todos))
  }

  stop(): void {
    this.sub?.unsubscribe()
    this.sub = undefined
    this.running$.next(false)
  }

  private handleDueSoon(todos: Todo[]): void {
    if (!todos.length) return
    const currentIds = new Set(todos.map((t) => t.id).filter((id) => Number.isInteger(id)))
    const notified = new Set([...this.loadNotified()].filter((id) => currentIds.has(id)))

    for (const t of todos) {
      if (!t?.id) continue
      if (notified.has(t.id)) continue
      const title = '期限が近い Todo'
      const body = t.title
      this.notificationService.showNotification(title, body, { url: '/dashboard/todo', todoId: t.id })
      notified.add(t.id)
    }

    this.saveNotified(notified)
  }

  private loadNotified(): Set<number> {
    try {
      const raw = localStorage.getItem(this.notifiedKey)
      if (!raw) return new Set<number>()
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return new Set<number>()
      return new Set<number>(parsed.filter((v) => Number.isInteger(v)))
    } catch {
      return new Set<number>()
    }
  }

  private saveNotified(set: Set<number>): void {
    try {
      localStorage.setItem(this.notifiedKey, JSON.stringify(Array.from(set)))
    } catch {
      // ignore
    }
  }
}

