import { Component, EventEmitter, OnDestroy, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'
import { SpeechRecognitionService } from '../../../../../services/speech-recognition.service'

@Component({
  selector: 'app-voice-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voice-input.component.html',
  styleUrls: ['./voice-input.component.scss']
})
export class VoiceInputComponent implements OnDestroy {
  @Output() textRecognized = new EventEmitter<string>()

  isListening = false
  isSupported = false
  error: string | null = null

  private destroy$ = new Subject<void>()

  constructor(private speech: SpeechRecognitionService) {
    this.isSupported = this.speech.isSupported()
  }

  ngOnDestroy(): void {
    this.speech.stopListening()
    this.destroy$.next()
    this.destroy$.complete()
  }

  toggle(): void {
    if (!this.isSupported) return
    if (this.isListening) {
      this.speech.stopListening()
      this.isListening = false
      this.error = null
      return
    }
    this.error = null
    this.isListening = true
    this.speech
      .startListening()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (text) => this.textRecognized.emit(text),
        error: (err) => {
          this.error = err?.message ?? '音声認識に失敗しました'
          this.isListening = false
        },
        complete: () => {
          this.isListening = false
        }
      })
  }
}
