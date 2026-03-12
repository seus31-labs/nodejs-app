import { Injectable } from '@angular/core'
import { Observable, Subject } from 'rxjs'

/** Web Speech API 用の型（標準 lib にないため定義） */
interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}
interface SpeechRecognitionResult {
  readonly length: number
  readonly isFinal: boolean
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}
interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string
  readonly message?: string
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition
    webkitSpeechRecognition?: new () => SpeechRecognition
  }
}

/**
 * Web Speech API の音声認識をラップするサービス。
 * 非対応ブラウザでは isSupported() が false。
 */
@Injectable({
  providedIn: 'root'
})
export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null

  /** ブラウザが音声認識をサポートするか */
  isSupported(): boolean {
    if (typeof window === 'undefined') return false
    return !!(window.SpeechRecognition ?? window.webkitSpeechRecognition)
  }

  /**
   * 音声認識を開始し、認識されたテキストを Observable で返す。
   * 最終結果（isFinal）ごとに emit し、認識終了で complete する。
   */
  startListening(lang = 'ja-JP'): Observable<string> {
    const subject = new Subject<string>()
    if (!this.isSupported()) {
      subject.error(new Error('Speech recognition is not supported'))
      return subject.asObservable()
    }

    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition!
    this.recognition = new Recognition()
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = lang

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.resultIndex
      const result = event.results[last]
      if (result.isFinal && result.length > 0) {
        const transcript = result[0].transcript?.trim()
        if (transcript) subject.next(transcript)
      }
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'aborted') {
        subject.error(new Error(event.error))
      }
      subject.complete()
    }

    this.recognition.onend = () => {
      subject.complete()
    }

    try {
      this.recognition.start()
    } catch (e) {
      subject.error(e)
      subject.complete()
    }

    return subject.asObservable()
  }

  stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop()
      } catch {
        // ignore
      }
      this.recognition = null
    }
  }
}
