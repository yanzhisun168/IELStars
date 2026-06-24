'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { copy } from '@/lib/i18n'

type UseVoiceRecorderOptions = {
  onRecordingComplete?: (audioBlob: Blob) => void
}

function getMicrophoneErrorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === 'NotAllowedError') {
    return copy.errors.microphoneDenied
  }

  if (error instanceof DOMException && error.name === 'NotFoundError') {
    return copy.errors.microphoneMissing
  }

  return copy.errors.microphoneStart
}

function getSupportedMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return undefined

  return ['audio/webm;codecs=opus', 'audio/webm'].find((mimeType) => MediaRecorder.isTypeSupported(mimeType))
}

export function useVoiceRecorder({ onRecordingComplete }: UseVoiceRecorderOptions = {}) {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioMimeType, setAudioMimeType] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [durationSeconds, setDurationSeconds] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const startedAtRef = useRef<number | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  const discardRecordingRef = useRef(false)
  const recordingIdRef = useRef(0)
  const onRecordingCompleteRef = useRef(onRecordingComplete)

  useEffect(() => {
    onRecordingCompleteRef.current = onRecordingComplete
  }, [onRecordingComplete])

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const stopStreamTracks = useCallback((stream: MediaStream | null) => {
    stream?.getTracks().forEach((track) => track.stop())
    if (streamRef.current === stream) streamRef.current = null
  }, [])

  const clearAudioUrl = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
    }

    setAudioUrl(null)
  }, [])

  const resetRecording = useCallback(() => {
    discardRecordingRef.current = true
    recordingIdRef.current += 1
    stopTimer()

    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.requestData()
      } catch {
        // Some browsers throw if no data has been captured yet.
      }
      recorder.stop()
    } else {
      stopStreamTracks(streamRef.current)
      mediaRecorderRef.current = null
    }

    chunksRef.current = []
    startedAtRef.current = null
    clearAudioUrl()
    setAudioBlob(null)
    setAudioMimeType(null)
    setDurationSeconds(0)
    setError(null)
    setIsRecording(false)
  }, [clearAudioUrl, stopStreamTracks, stopTimer])

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (!recorder || recorder.state === 'inactive') return

    stopTimer()

    try {
      recorder.requestData()
    } catch {
      // The final dataavailable event will still be requested by stop().
    }

    try {
      recorder.stop()
    } catch {
      setIsRecording(false)
      setError(copy.errors.recordingStop)
      stopStreamTracks(streamRef.current)
      mediaRecorderRef.current = null
    }
  }, [stopStreamTracks, stopTimer])

  const startRecording = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError(copy.errors.recordingUnsupported)
      return
    }

    if (typeof MediaRecorder === 'undefined') {
      setError(copy.errors.recordingUnsupported)
      return
    }

    if (mediaRecorderRef.current?.state === 'recording') return

    resetRecording()
    discardRecordingRef.current = false
    const recordingId = recordingIdRef.current + 1
    recordingIdRef.current = recordingId

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const requestedMimeType = getSupportedMimeType()
      const recorder = requestedMimeType ? new MediaRecorder(stream, { mimeType: requestedMimeType }) : new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (recordingIdRef.current === recordingId && event.data && event.data.size > 0) chunksRef.current.push(event.data)
      }

      recorder.onerror = () => {
        stopTimer()
        if (recordingIdRef.current !== recordingId) {
          stopStreamTracks(stream)
          return
        }
        if (mediaRecorderRef.current === recorder) mediaRecorderRef.current = null
        setIsRecording(false)
        setError(copy.errors.recordingUnexpected)
        stopStreamTracks(stream)
      }

      recorder.onstop = () => {
        stopTimer()
        if (recordingIdRef.current !== recordingId) {
          stopStreamTracks(stream)
          return
        }
        if (mediaRecorderRef.current === recorder) mediaRecorderRef.current = null
        setIsRecording(false)

        try {
          if (discardRecordingRef.current) return

          if (chunksRef.current.length === 0) {
            setError(copy.errors.noAudio)
            return
          }

          const mimeType = recorder.mimeType || requestedMimeType || 'audio/webm'
          const blob = new Blob(chunksRef.current, { type: mimeType })
          if (blob.size === 0) {
            setError(copy.errors.noAudio)
            return
          }

          const nextAudioUrl = URL.createObjectURL(blob)
          clearAudioUrl()
          audioUrlRef.current = nextAudioUrl
          setAudioBlob(blob)
          setAudioMimeType(blob.type || mimeType)
          setAudioUrl(nextAudioUrl)
          setError(null)
          onRecordingCompleteRef.current?.(blob)
        } finally {
          chunksRef.current = []
          discardRecordingRef.current = false
          stopStreamTracks(stream)
        }
      }

      startedAtRef.current = Date.now()
      setDurationSeconds(0)
      setError(null)
      recorder.start(250)
      setIsRecording(true)
      timerRef.current = window.setInterval(() => {
        if (startedAtRef.current !== null) {
          setDurationSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000))
        }
      }, 250)
    } catch (caughtError) {
      stopStreamTracks(streamRef.current)
      mediaRecorderRef.current = null
      setIsRecording(false)
      setError(getMicrophoneErrorMessage(caughtError))
    }
  }, [clearAudioUrl, resetRecording, stopStreamTracks, stopTimer])

  useEffect(() => {
    return () => {
      stopTimer()
      const recorder = mediaRecorderRef.current
      if (recorder && recorder.state !== 'inactive') {
        recorder.ondataavailable = null
        recorder.onstop = null
        recorder.onerror = null
        try {
          recorder.stop()
        } catch {
          // The recorder may already be stopping.
        }
      }
      stopStreamTracks(streamRef.current)
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
    }
  }, [stopStreamTracks, stopTimer])

  return {
    audioBlob,
    audioMimeType,
    audioUrl,
    durationSeconds,
    error,
    isReadyToPlay: Boolean(audioBlob && audioUrl),
    isRecording,
    resetRecording,
    startRecording,
    stopRecording,
  }
}
