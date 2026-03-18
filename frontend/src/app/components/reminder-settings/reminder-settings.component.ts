import { AsyncPipe, CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { NotificationService } from '../../services/notification.service'
import { ReminderService } from '../../services/reminder.service'

type PermissionState = NotificationPermission | 'unsupported'

@Component({
  selector: 'app-reminder-settings',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './reminder-settings.component.html',
  styleUrls: ['./reminder-settings.component.scss'],
})
export class ReminderSettingsComponent {
  readonly reminderRunning$ = this.reminderService.running$

  apiAvailable = this.isNotificationApiAvailable()
  permission: PermissionState = this.getInitialPermission()
  loadingRequest = false

  message: string | null = null

  constructor(
    private notificationService: NotificationService,
    private reminderService: ReminderService
  ) {}

  get permissionLabel(): string {
    if (!this.apiAvailable) return '未対応'
    return this.permission === 'unsupported' ? '未対応' : this.permission
  }

  async requestPermission(): Promise<void> {
    if (!this.apiAvailable) {
      this.message = 'このブラウザでは通知が利用できません。'
      this.permission = 'unsupported'
      return
    }
    this.loadingRequest = true
    this.message = null
    try {
      const p = await this.notificationService.requestPermission()
      this.permission = p
      this.message = p === 'granted' ? '通知権限を許可しました。' : '通知権限は許可されませんでした。'
    } catch {
      this.message = '通知権限のリクエストに失敗しました。'
    } finally {
      this.loadingRequest = false
    }
  }

  sendTestNotification(): void {
    if (!this.apiAvailable || this.permission !== 'granted') return
    this.notificationService.showNotification(
      '通知テスト',
      'リマインダー通知が表示されるか確認してください。',
      { url: '/dashboard/todos' }
    )
    this.message = '通知テストを送信しました。'
  }

  private isNotificationApiAvailable(): boolean {
    const N = (globalThis as any).Notification as typeof Notification | undefined
    return !!N
  }

  private getInitialPermission(): PermissionState {
    const N = (globalThis as any).Notification as typeof Notification | undefined
    if (!N) return 'unsupported'
    return N.permission as NotificationPermission
  }
}

