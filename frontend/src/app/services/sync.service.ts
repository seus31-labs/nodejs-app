import { Injectable, OnDestroy } from '@angular/core'
import { Subject } from 'rxjs'
import { pairwise, startWith, takeUntil } from 'rxjs/operators'
import { NetworkStatusService } from './network-status.service'
import { TodoService } from './todo.service'

/**
 * オンライン復帰時に Todo 一覧を再取得しオフラインキャッシュを更新する（20.7）。
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
          this.todoService.list().subscribe({
            error: () => {
              // 同期失敗は silent（キャッシュは既存のまま）
            }
          })
        }
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
