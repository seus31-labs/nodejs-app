import { Injectable, OnDestroy } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'

/**
 * オンライン/オフライン状態を検知するサービス。
 * 20.6 以降でオフライン時の保存・オンライン復帰時の同期のトリガーに利用する。
 */
@Injectable({
  providedIn: 'root'
})
export class NetworkStatusService implements OnDestroy {
  private readonly isOnline$ = new BehaviorSubject<boolean>(this.getInitial())
  private readonly onOnline = () => this.isOnline$.next(true)
  private readonly onOffline = () => this.isOnline$.next(false)

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.onOnline)
      window.addEventListener('offline', this.onOffline)
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.onOnline)
      window.removeEventListener('offline', this.onOffline)
    }
    this.isOnline$.complete()
  }

  private getInitial(): boolean {
    if (typeof navigator === 'undefined') return true
    return navigator.onLine
  }

  /** 現在オンラインか */
  get isOnline(): boolean {
    return this.isOnline$.getValue()
  }

  /** オンライン状態の変化ストリーム */
  get onlineChanges(): Observable<boolean> {
    return this.isOnline$.asObservable()
  }
}
