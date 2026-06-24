'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { copy } from '@/lib/i18n'

function joinTranscript(...parts: string[]): string {
  return parts.map((part) => part.trim()).filter(Boolean).join(' ')
}

function getRecognitionErrorMessage(error: string): string {
  if (error === 'not-allowed' || error === 'service-not-allowed') {
    return copy.errors.transcriptionDenied
  }

  if (error === 'no-speech') {
    return copy.errors.noSpeech
  }

  if (error === 'audio-capture') {
    return copy.errors.transcriptionMicrophone
  }

  if (error === 'network') {
    return copy.errors.transcriptionNetwork
  }

  return copy.errors.transcriptionUnexpected
}

export function useBrowserSpeechRecognition() {
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [finalTranscript, setFinalTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState('en-US')

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const finalTranscriptRef = useRef('')

  const disposeRecognition = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition) return

    recognition.onend = null
    recognition.onerror = null
    recognition.onresult = null
    recognitionRef.current = null

    try {
      recognition.abort()
    } catch {
      // The recognition session may already be inactive.
    }
  }, [])

  const resetTranscript = useCallback(() => {
    disposeRecognition()
    finalTranscriptRef.current = ''
    setFinalTranscript('')
    setInterimTranscript('')
    setTranscript('')
    setError(null)
    setIsListening(false)
  }, [disposeRecognition])

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition) return

    try {
      recognition.stop()
    } catch {
      setIsListening(false)
    }
  }, [])

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return

    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!Recognition) {
      setIsSupported(false)
      setError(copy.transcription.unsupported)
      return
    }

    if (recognitionRef.current) return

    setIsSupported(true)
    setError(null)
    const recognition = new Recognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = language

    recognition.onresult = (event) => {
      const finalParts: string[] = []
      const interimParts: string[] = []

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        const value = result[0]?.transcript ?? ''

        if (result.isFinal) finalParts.push(value)
        else interimParts.push(value)
      }

      const nextFinalTranscript = joinTranscript(finalTranscriptRef.current, ...finalParts)
      const nextInterimTranscript = joinTranscript(...interimParts)
      finalTranscriptRef.current = nextFinalTranscript
      setFinalTranscript(nextFinalTranscript)
      setInterimTranscript(nextInterimTranscript)
      setTranscript(joinTranscript(nextFinalTranscript, nextInterimTranscript))
    }

    recognition.onerror = (event) => {
      setError(getRecognitionErrorMessage(event.error))
    }

    recognition.onend = () => {
      if (recognitionRef.current === recognition) recognitionRef.current = null
      setIsListening(false)
      setInterimTranscript('')
      setTranscript(joinTranscript(finalTranscriptRef.current))
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
      setIsListening(true)
    } catch {
      recognitionRef.current = null
      setIsListening(false)
      setError(copy.errors.transcriptionStart)
    }
  }, [language])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition))
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    return () => disposeRecognition()
  }, [disposeRecognition])

  return {
    error,
    finalTranscript,
    interimTranscript,
    isListening,
    isSupported,
    language,
    resetTranscript,
    setLanguage,
    startListening,
    stopListening,
    transcript,
  }
}
