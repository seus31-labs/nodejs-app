import { Component } from '@angular/core'
import { AsyncPipe } from '@angular/common'
import { NetworkStatusService } from '../../../../services/network-status.service'
import { SyncService } from '../../../../services/sync.service'

/**
 * オフライン時・同期中の表示（20.10, 20.11）。
 */
@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './offline-indicator.component.html',
  styleUrls: ['./offline-indicator.component.scss']
})
export class OfflineIndicatorComponent {
  constructor(
    public networkStatus: NetworkStatusService,
    public syncService: SyncService
  ) {}
}
