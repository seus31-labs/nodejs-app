import { TestBed } from '@angular/core/testing'
import { SpeechRecognitionService } from './speech-recognition.service'

describe('SpeechRecognitionService (18)', () => {
  let service: SpeechRecognitionService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(SpeechRecognitionService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should return boolean from isSupported() depending on browser', () => {
    expect(typeof service.isSupported()).toBe('boolean')
  })

  it('stopListening() should not throw when recognition is null', () => {
    expect(() => service.stopListening()).not.toThrow()
  })

  it('should error when startListening() is called and not supported', (done) => {
    if (service.isSupported()) {
      done()
      return
    }
    service.startListening().subscribe({
      error: (err) => {
        expect(err?.message).toContain('not supported')
        done()
      },
      complete: () => done.fail('expected error')
    })
  })
})
