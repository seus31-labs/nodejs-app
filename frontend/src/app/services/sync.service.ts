import { Injectable, OnDestroy } from '@angular/core'
import { Subject } from 'rxjs'
import { pairwise, startWith, takeUntil } from 'rxjs/operators'
import { NetworkStatusService } from './network-status.service'
import { TodoService } from './todo.service'

/**
 * オンライン復帰時に Todo 一覧を再取得しオフラインキャッシュを更新する（20.7）。
 * 競合解決（20.8）: オンライン復帰時はサーバー取得結果でキャッシュを上書き（サーバー優先）。
 * 20.9 で拡張予定。
 */
@Injectable({
  providedIn: 'root'
})
export class SyncService implements OnDestroy {
  private readonly destroy$ = new Subject<void>()

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

  /**
   * オンライン復帰時の同期。競合解決はサーバー優先（取得結果でキャッシュを上書き）（20.8）。
   */
  private syncAfterReconnect(): void {
    this.todoService
      .list()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: () => {
          // 同期失敗は silent（キャッシュは既存のまま）
        }
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
