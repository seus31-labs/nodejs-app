import { Component, Inject, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { Subscription } from 'rxjs'
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatOptionModule } from '@angular/material/core'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { SharePermission } from '../../../../../models/share.interface'
import { UserService } from '../../../../../services/user.service'
import type { User } from '../../../../../models/user.interface'

export interface ShareDialogData {
  todoId: number
  initialPermission?: SharePermission
}

@Component({
  selector: 'app-share-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './share-dialog.component.html',
  styleUrl: './share-dialog.component.scss'
})
export class ShareDialogComponent implements OnInit, OnDestroy {
  readonly permissionOptions: Array<{ value: SharePermission; label: string }> = [
    { value: 'view', label: '閲覧のみ' },
    { value: 'edit', label: '編集可' }
  ]

  searchControl = new FormControl<string>('', { nonNullable: true })
  permission: SharePermission
  selectedUserId: number | null = null

  loading = false
  error: string | null = null
  users: User[] = []

  private sub = new Subscription()

  constructor(
    public dialogRef: MatDialogRef<ShareDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ShareDialogData,
    private userService: UserService
  ) {
    this.permission = data.initialPermission ?? 'view'
  }

  ngOnInit(): void {
    this.loadUsers()
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe()
  }

  get normalizedSearch(): string {
    return (this.searchControl.value ?? '').trim().toLowerCase()
  }

  get filteredUsers(): User[] {
    const q = this.normalizedSearch
    if (!q) return this.users
    return this.users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q))
  }

  selectUser(userId: number): void {
    this.selectedUserId = userId
  }

  private loadUsers(): void {
    this.loading = true
    this.error = null
    const s = this.userService.list(1, 50).subscribe({
      next: (res) => {
        this.users = res.users ?? []
        this.loading = false
      },
      error: (err) => {
        this.error = err?.error?.message ?? err?.message ?? 'ユーザー一覧の取得に失敗しました'
        this.loading = false
      }
    })
    this.sub.add(s)
  }

  canShare(): boolean {
    return this.selectedUserId != null
  }

  share(): void {
    if (!this.canShare() || this.selectedUserId == null) return
    this.dialogRef.close({
      sharedWithUserId: this.selectedUserId,
      permission: this.permission
    })
  }

  cancel(): void {
    this.dialogRef.close()
  }
}

