import { Injectable } from '@angular/core'
import { Router } from '@angular/router'

export interface AppNotificationData {
  url?: string
  todoId?: number
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private router: Router) {}

  async requestPermission(): Promise<NotificationPermission> {
    const N = (globalThis as any).Notification as typeof Notification | undefined
    if (!N) return 'denied'
    if (N.permission !== 'default') return N.permission
    return await N.requestPermission()
  }

  showNotification(title: string, body: string, data?: AppNotificationData): void {
    const N = (globalThis as any).Notification as typeof Notification | undefined
    if (!N) return
    if (N.permission !== 'granted') return

    const n = new N(title, { body, data })
    n.onclick = () => {
      const url = data?.url
      if (url) {
        this.router.navigateByUrl(url).catch(() => {})
      }
      n.close()
    }
  }
}

