import { Component } from '@angular/core'
import { AsyncPipe, CommonModule } from '@angular/common'
import { NetworkStatusService } from '../../../../services/network-status.service'

/**
 * オフライン時に表示するインジケーター（20.10）。
 */
@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './offline-indicator.component.html',
  styleUrls: ['./offline-indicator.component.scss']
})
export class OfflineIndicatorComponent {
  constructor(public networkStatus: NetworkStatusService) {}
}
