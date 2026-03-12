import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Subject } from 'rxjs'
import { VoiceInputComponent } from './voice-input.component'
import { SpeechRecognitionService } from '../../../../../services/speech-recognition.service'

describe('VoiceInputComponent (18)', () => {
  let component: VoiceInputComponent
  let fixture: ComponentFixture<VoiceInputComponent>
  let speechService: jasmine.SpyObj<SpeechRecognitionService>
  let result$: Subject<string>

  beforeEach(async () => {
    result$ = new Subject<string>()
    speechService = jasmine.createSpyObj('SpeechRecognitionService', ['isSupported', 'startListening', 'stopListening'])
    speechService.isSupported.and.returnValue(true)
    speechService.startListening.and.returnValue(result$.asObservable())

    await TestBed.configureTestingModule({
      imports: [VoiceInputComponent],
      providers: [{ provide: SpeechRecognitionService, useValue: speechService }]
    }).compileComponents()

    fixture = TestBed.createComponent(VoiceInputComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set isSupported from service', () => {
    expect(component.isSupported).toBe(true)
  })

  it('should call startListening on first toggle and emit text on result', () => {
    const emitSpy = jasmine.createSpy('textRecognized')
    component.textRecognized.subscribe(emitSpy)

    component.toggle()
    expect(speechService.startListening).toHaveBeenCalled()
    expect(component.isListening).toBe(true)

    result$.next('テスト')
    result$.complete()

    expect(emitSpy).toHaveBeenCalledWith('テスト')
    expect(component.isListening).toBe(false)
  })

  it('should call stopListening on second toggle', () => {
    component.toggle()
    expect(speechService.startListening).toHaveBeenCalled()
    component.toggle()
    expect(speechService.stopListening).toHaveBeenCalled()
    expect(component.isListening).toBe(false)
  })

  it('should not start when not supported', () => {
    speechService.isSupported.and.returnValue(false)
    fixture = TestBed.createComponent(VoiceInputComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    component.toggle()
    expect(speechService.startListening).not.toHaveBeenCalled()
  })
})
