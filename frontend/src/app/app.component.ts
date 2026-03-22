import { Component, OnDestroy, OnInit } from '@angular/core'
import { NavigationEnd, Router, RouterOutlet } from '@angular/router'
import { MatDialog } from '@angular/material/dialog'
import { Subject, filter, takeUntil } from 'rxjs'
import { SharedModule } from './theme/shared/shared.module'
import { ThemeService } from './services/theme.service'
import { KeyboardShortcutService, KEYBOARD_SHORTCUT_IDS } from './services/keyboard-shortcut.service'
import { SyncService } from './services/sync.service'
import { ShortcutHelpDialogComponent } from './components/pages/dashboard/todo/shortcut-help-dialog/shortcut-help-dialog.component'
import { AuthService } from './services/auth.service'
import { ReminderService } from './services/reminder.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    RouterOutlet,
    SharedModule
  ],
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Node App Frontend'
  private destroy$ = new Subject<void>()

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private shortcutService: KeyboardShortcutService,
    private dialog: MatDialog,
    private syncService: SyncService,
    private authService: AuthService,
    private reminderService: ReminderService
  ) {}

  ngOnInit() {
    this.themeService.init()
    this.router.events
      .pipe(
        filter((evt): evt is NavigationEnd => evt instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => window.scrollTo(0, 0))

    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((authed) => {
        if (authed) this.reminderService.start()
        else this.reminderService.stop()
      })

    this.shortcutService.registerBinding({
      id: KEYBOARD_SHORTCUT_IDS.HELP,
      defaultKeys: 'shift+?',
      defaultKeysLabel: 'Shift+?',
      handler: () => this.dialog.open(ShortcutHelpDialogComponent, { width: '520px' }),
      description: 'ショートカット一覧を表示',
    })
  }

  ngOnDestroy() {
    this.shortcutService.unregisterBinding(KEYBOARD_SHORTCUT_IDS.HELP)
    this.destroy$.next()
    this.destroy$.complete()
  }
}
