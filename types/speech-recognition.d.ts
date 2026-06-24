export {}

declare global {
  interface SpeechRecognitionAlternative {
    confidence: number
    transcript: string
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean
    readonly length: number
    [index: number]: SpeechRecognitionAlternative
  }

  interface SpeechRecognitionResultList {
    readonly length: number
    [index: number]: SpeechRecognitionResult
  }

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number
    readonly results: SpeechRecognitionResultList
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string
    readonly message: string
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    onend: ((this: SpeechRecognition, event: Event) => void) | null
    onerror: ((this: SpeechRecognition, event: SpeechRecognitionErrorEvent) => void) | null
    onresult: ((this: SpeechRecognition, event: SpeechRecognitionEvent) => void) | null
    abort(): void
    start(): void
    stop(): void
  }

  type SpeechRecognitionConstructor = new () => SpeechRecognition

  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}
