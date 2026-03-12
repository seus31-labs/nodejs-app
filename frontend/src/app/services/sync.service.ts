import { Injectable, OnDestroy } from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { finalize, pairwise, startWith, takeUntil } from 'rxjs/operators'
import { NetworkStatusService } from './network-status.service'
import { TodoService } from './todo.service'

/**
 * オンライン復帰時に Todo 一覧を再取得しオフラインキャッシュを更新する（20.7）。
 * 競合解決（20.8）: オンライン復帰時はサーバー取得結果でキャッシュを上書き（サーバー優先）。
 * 同期状態（20.11）: isSyncing$ で同期中かどうかを公開。
 */
@Injectable({
  providedIn: 'root'
})
export class SyncService implements OnDestroy {
  private readonly destroy$ = new Subject<void>()
  private readonly isSyncing$ = new BehaviorSubject<boolean>(false)

  constructor(
    private networkStatus: NetworkStatusService,
    private todoService: TodoService
  ) {
    this.networkStatus.onlineChanges
      .pipe(
        startWith(this.networkStatus.isOnline),
        pairwise(),
        takeUntil(this.destroy$)
      )
      .subscribe(([prev, curr]) => {
        if (prev === false && curr === true) {
          this.syncAfterReconnect()
        }
      })
  }

  /** 同期中かどうか（20.11 表示用） */
  get syncingChanges(): Observable<boolean> {
    return this.isSyncing$.asObservable()
  }

  /**
   * オンライン復帰時の同期。競合解決はサーバー優先（取得結果でキャッシュを上書き）（20.8）。
   */
  private syncAfterReconnect(): void {
    this.isSyncing$.next(true)
    this.todoService
      .list()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSyncing$.next(false))
      )
      .subscribe({
        error: () => {
          // 同期失敗は silent（キャッシュは既存のまま）
        }
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.isSyncing$.complete()
  }
}
