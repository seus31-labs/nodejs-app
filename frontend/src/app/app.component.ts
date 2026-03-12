import { Component, OnDestroy, OnInit } from '@angular/core'
import { NavigationEnd, Router, RouterOutlet } from '@angular/router'
import { MatDialog } from '@angular/material/dialog'
import { SharedModule } from './theme/shared/shared.module'
import { ThemeService } from './services/theme.service'
import { KeyboardShortcutService } from './services/keyboard-shortcut.service'
import { SyncService } from './services/sync.service'
import { ShortcutHelpDialogComponent } from './components/pages/dashboard/todo/shortcut-help-dialog/shortcut-help-dialog.component'

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

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private shortcutService: KeyboardShortcutService,
    private dialog: MatDialog,
    private syncService: SyncService
  ) {}

  ngOnInit() {
    this.themeService.init()
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return
      }
      window.scrollTo(0, 0)
    })
    this.shortcutService.register('Shift+?', () => {
      this.dialog.open(ShortcutHelpDialogComponent, { width: '400px' })
    }, 'ショートカット一覧を表示')
  }

  ngOnDestroy() {
    this.shortcutService.unregister('Shift+?')
  }
}
