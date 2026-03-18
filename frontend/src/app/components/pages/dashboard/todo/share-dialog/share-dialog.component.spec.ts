import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { of } from 'rxjs'
import { ShareDialogComponent, type ShareDialogData } from './share-dialog.component'
import { UserService } from '../../../../../services/user.service'
import type { UserListResponse } from '../../../../../models/user.interface'
import type { User } from '../../../../../models/user.interface'
import type { SharePermission } from '../../../../../models/share.interface'

describe('ShareDialogComponent (11.9)', () => {
  let component: ShareDialogComponent
  let fixture: ComponentFixture<ShareDialogComponent>
  let dialogRef: jasmine.SpyObj<MatDialogRef<ShareDialogComponent>>
  let userService: jasmine.SpyObj<UserService>

  const baseData: ShareDialogData = { todoId: 1, initialPermission: 'view' }

  const mockUsers: User[] = [
    { id: 1, name: 'Alice', email: 'alice@test.local' },
    { id: 2, name: 'Bob', email: 'bob@test.local' }
  ]

  const listResponse: UserListResponse<User> = {
    users: mockUsers,
    totalItems: 2,
    currentPage: 1,
    limit: 50,
    totalPages: 1
  }

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close'])
    userService = jasmine.createSpyObj('UserService', ['list'])
    userService.list.and.returnValue(of(listResponse))

    await TestBed.configureTestingModule({
      imports: [ShareDialogComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: baseData },
        { provide: UserService, useValue: userService }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(ShareDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should load users on init', () => {
    expect(userService.list).toHaveBeenCalled()
    expect(component.users.length).toBe(2)
  })

  it('should filter users by search term', () => {
    component.searchControl.setValue('alice')
    expect(component.filteredUsers.length).toBe(1)
    expect(component.filteredUsers[0].id).toBe(1)
  })

  it('should close with shared user and permission on share()', () => {
    component.selectedUserId = 2
    component.permission = 'edit' as SharePermission
    component.share()

    expect(dialogRef.close).toHaveBeenCalledWith({
      sharedWithUserId: 2,
      permission: 'edit'
    })
  })

  it('should close without payload on cancel()', () => {
    component.cancel()
    expect(dialogRef.close).toHaveBeenCalledWith()
  })
})

