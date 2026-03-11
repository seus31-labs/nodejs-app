import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { MatDialogRef } from '@angular/material/dialog'
import { of, throwError } from 'rxjs'
import { ImportDialogComponent } from './import-dialog.component'
import { ImportService } from '../../../../../services/import.service'

describe('ImportDialogComponent (17.18)', () => {
  let component: ImportDialogComponent
  let fixture: ComponentFixture<ImportDialogComponent>
  let importService: jasmine.SpyObj<ImportService>
  let dialogRef: jasmine.SpyObj<MatDialogRef<ImportDialogComponent>>

  beforeEach(async () => {
    importService = jasmine.createSpyObj('ImportService', ['import'])
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close'])
    await TestBed.configureTestingModule({
      imports: [ImportDialogComponent],
      providers: [
        provideNoopAnimations(),
        { provide: ImportService, useValue: importService },
        { provide: MatDialogRef, useValue: dialogRef }
      ]
    }).compileComponents()
    fixture = TestBed.createComponent(ImportDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set selectedFile on file selection', () => {
    const file = new File(['{}'], 'todos.json', { type: 'application/json' })
    const event = { target: { files: [file], value: '' } } as unknown as Event
    component.onFileSelected(event)
    expect(component.selectedFile).toBe(file)
  })

  it('should call close with true when close() after result', () => {
    component.result = { created: 2, failed: 0 }
    component.close()
    expect(dialogRef.close).toHaveBeenCalledWith(true)
  })

  it('should set result and clear loading on successful import (runImport)', (done) => {
    const file = new File(['{"todos":[]}'], 'todos.json', { type: 'application/json' })
    component.selectedFile = file
    importService.import.and.returnValue(of({ created: 1, failed: 0 }))
    component.runImport()
    // FileReader.onload は非同期のため少し待つ
    setTimeout(() => {
      expect(component.result).toEqual({ created: 1, failed: 0 })
      expect(component.importing).toBe(false)
      expect(importService.import).toHaveBeenCalledWith('json', { todos: [] })
      done()
    }, 100)
  })

  it('should set error and clear loading on failed import (runImport)', (done) => {
    const file = new File(['{"todos":[]}'], 'todos.json', { type: 'application/json' })
    component.selectedFile = file
    importService.import.and.returnValue(
      throwError(() => ({ error: { message: 'Server error' } }))
    )
    component.runImport()
    setTimeout(() => {
      expect(component.error).toBeTruthy()
      expect(component.importing).toBe(false)
      done()
    }, 100)
  })
})
