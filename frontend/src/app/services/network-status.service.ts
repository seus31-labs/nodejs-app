import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'

/**
 * オンライン/オフライン状態を検知するサービス。
 * 20.6 以降でオフライン時の保存・オンライン復帰時の同期のトリガーに利用する。
 */
@Injectable({
  providedIn: 'root'
})
export class NetworkStatusService {
  private readonly isOnline$ = new BehaviorSubject<boolean>(this.getInitial())

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.isOnline$.next(true))
      window.addEventListener('offline', () => this.isOnline$.next(false))
    }
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
