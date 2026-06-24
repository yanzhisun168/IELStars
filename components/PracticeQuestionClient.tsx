'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { AudioFeedbackReport } from '@/components/AudioFeedbackReport'
import { BrowserSpeechTranscriber } from '@/components/BrowserSpeechTranscriber'
import { PracticeActionPanel } from '@/components/PracticeActionPanel'
import { PracticeProgressSteps } from '@/components/PracticeProgressSteps'
import { PostRecordingTranscriber } from '@/components/PostRecordingTranscriber'
import { QuestionCard } from '@/components/QuestionCard'
import { SessionSummaryCard } from '@/components/SessionSummaryCard'
import { SaveAttemptButton } from '@/components/SaveAttemptButton'
import { SpeakingFeedbackReport } from '@/components/SpeakingFeedbackReport'
import { TranscriptEditor } from '@/components/TranscriptEditor'
import { VoiceRecorder } from '@/components/VoiceRecorder'
import { evaluateSpeakingAudio } from '@/lib/evaluateSpeakingAudio'
import { evaluateSpeakingAnswer } from '@/lib/evaluateSpeaking'
import type { AudioSpeakingEvaluationResult } from '@/lib/audioEvaluationTypes'
import type { SpeakingEvaluationResult } from '@/lib/evaluationTypes'
import { copy } from '@/lib/i18n'
import type { PracticeFlowState, PracticeStepStatus } from '@/lib/practiceFlowTypes'
import { getRandomPart1Question, getRandomPart2CueCard, getRandomPart3Question } from '@/lib/questionBank'
import { routes } from '@/lib/routes'
import { countWords } from '@/lib/textStats'
import type { Part1Question, Part2CueCard, Part3Question, SpeakingPart } from '@/lib/types'

type PracticeQuestionClientProps = { mode: SpeakingPart }
type PracticeQuestion = Part1Question | Part2CueCard | Part3Question
type CompletedAudioFeedback = Extract<AudioSpeakingEvaluationResult, { status: 'completed' }>

const recordingSettings = {
  part1: { maxDurationSeconds: 45, minDurationSeconds: 8 },
  part2: { maxDurationSeconds: 120, minDurationSeconds: 45 },
  part3: { maxDurationSeconds: 90, minDurationSeconds: 20 },
} as const

const transcriptMinimumWords = { part1: 15, part2: 70, part3: 35 } as const

function getQuestionForMode(mode: SpeakingPart): PracticeQuestion {
  if (mode === 'part1') return getRandomPart1Question()
  if (mode === 'part2') return getRandomPart2CueCard()
  return getRandomPart3Question()
}

function getQuestionText(question: PracticeQuestion): string {
  return question.part === 'part2'
    ? [question.title, question.prompt, ...question.bulletPoints].join('\n')
    : question.question
}

export function PracticeQuestionClient({ mode }: PracticeQuestionClientProps) {
  const [question, setQuestion] = useState<PracticeQuestion | null>(null)
  const [rawTranscript, setRawTranscript] = useState('')
  const [editedTranscript, setEditedTranscript] = useState('')
  const [hasEditedTranscript, setHasEditedTranscript] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [questionSession, setQuestionSession] = useState(0)
  const [feedback, setFeedback] = useState<Extract<SpeakingEvaluationResult, { status: 'completed' }> | null>(null)
  const [audioFeedback, setAudioFeedback] = useState<CompletedAudioFeedback | null>(null)
  const [evaluationError, setEvaluationError] = useState<string | null>(null)
  const [audioEvaluationError, setAudioEvaluationError] = useState<string | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [isAudioEvaluating, setIsAudioEvaluating] = useState(false)
  const [flowState, setFlowState] = useState<PracticeFlowState>({ currentStep: 'question', attempts: [] })

  useEffect(() => {
    const timer = window.setTimeout(() => setQuestion(getQuestionForMode(mode)), 0)
    return () => window.clearTimeout(timer)
  }, [mode])

  function resetCurrentQuestion(step: PracticeStepStatus = 'question') {
    setRawTranscript('')
    setEditedTranscript('')
    setHasEditedTranscript(false)
    setAudioBlob(null)
    setQuestionSession((session) => session + 1)
    setFeedback(null)
    setAudioFeedback(null)
    setEvaluationError(null)
    setAudioEvaluationError(null)
    setIsEvaluating(false)
    setIsAudioEvaluating(false)
    setFlowState((state) => ({ ...state, currentStep: step }))
  }

  function retryQuestion() { resetCurrentQuestion() }

  function showNextQuestion() {
    resetCurrentQuestion()
    setQuestion(getQuestionForMode(mode))
  }

  function updateFlowForTranscript(value: string) {
    if (isEvaluating || isAudioEvaluating) return
    const nextStep: PracticeStepStatus = value.trim() ? 'transcript' : 'question'
    setFlowState((state) => state.currentStep === nextStep ? state : { ...state, currentStep: nextStep })
  }

  function handleRawTranscriptChange(value: string) {
    setRawTranscript(value)
    if (!hasEditedTranscript) setEditedTranscript(value)
    updateFlowForTranscript(value)
  }

  function handleEditedTranscriptChange(value: string) {
    setHasEditedTranscript(true)
    setEditedTranscript(value)
    updateFlowForTranscript(value)
  }

  function handleRecordedRawTranscript(value: string) { setRawTranscript(value) }

  function handleRecordedTranscript(value: string) {
    setHasEditedTranscript(true)
    setEditedTranscript(value)
    updateFlowForTranscript(value)
  }

  function handleRecordingStateChange(isRecording: boolean) {
    if (isEvaluating || isAudioEvaluating) return
    const nextStep: PracticeStepStatus = isRecording ? 'recording' : editedTranscript.trim() ? 'transcript' : 'question'
    setFlowState((state) => state.currentStep === nextStep ? state : { ...state, currentStep: nextStep })
  }

  function saveAttempt(result: { estimatedBand: number; criteria: Record<'fluencyAndCoherence' | 'lexicalResource' | 'grammaticalRangeAndAccuracy' | 'pronunciation', number> }) {
    if (!question) return
    setFlowState((state) => {
      const attemptId = `${question.id}-${questionSession}`
      const attempt = { id: attemptId, part: question.part, topic: question.topic, question: getQuestionText(question), transcript: editedTranscript, estimatedBand: result.estimatedBand, completedAt: new Date().toISOString(), hasFeedback: true, criteria: result.criteria }
      const attempts = state.attempts.some((item) => item.id === attemptId)
        ? state.attempts.map((item) => item.id === attemptId ? attempt : item)
        : [...state.attempts, attempt]
      return { currentStep: 'feedback', attempts }
    })
  }

  async function getTextFeedback() {
    if (!question) return
    setIsEvaluating(true)
    setEvaluationError(null)
    setFeedback(null)
    setFlowState((state) => ({ ...state, currentStep: 'feedback' }))
    const result = await evaluateSpeakingAnswer({ part: question.part, question: getQuestionText(question), topic: question.topic, transcript: editedTranscript, mode: 'single_question' })
    setIsEvaluating(false)
    if (result.status === 'failed') {
      setEvaluationError(result.error)
      updateFlowForTranscript(editedTranscript)
      return
    }
    setFeedback(result)
    saveAttempt(result)
  }

  async function getAudioFeedback() {
    if (!question || !audioBlob) return
    setIsAudioEvaluating(true)
    setAudioEvaluationError(null)
    setAudioFeedback(null)
    setFlowState((state) => ({ ...state, currentStep: 'feedback' }))
    const result = await evaluateSpeakingAudio({ audioBlob, part: question.part, question: getQuestionText(question), topic: question.topic, rawTranscript, editedTranscript, mode: 'single_question' })
    setIsAudioEvaluating(false)
    if (result.status === 'failed') {
      setAudioEvaluationError(result.error)
      updateFlowForTranscript(editedTranscript)
      return
    }
    setAudioFeedback(result)
    saveAttempt(result)
  }

  const transcriptIsLongEnough = countWords(editedTranscript) >= transcriptMinimumWords[mode]
  const hasAnyFeedback = Boolean(feedback || audioFeedback)

  return (
    <div className="mt-10">
      {question ? <PracticeProgressSteps currentStep={flowState.currentStep} /> : null}
      {question ? <QuestionCard question={question} /> : <div className="h-72 animate-pulse rounded-2xl bg-slate-200" aria-label="Loading a question" />}
      {question ? <>
        <VoiceRecorder {...recordingSettings[mode]} resetKey={`${question.id}-${questionSession}`} onRecordingComplete={setAudioBlob} onRecordingStateChange={handleRecordingStateChange} />
        <PostRecordingTranscriber audioBlob={audioBlob} part={question.part} question={getQuestionText(question)} topic={question.topic} onRawTranscriptGenerated={handleRecordedRawTranscript} onTranscriptGenerated={handleRecordedTranscript} resetKey={`${question.id}-${questionSession}`} />
        <BrowserSpeechTranscriber onTranscriptUpdate={handleRawTranscriptChange} resetKey={`${question.id}-${questionSession}`} />
        <TranscriptEditor transcript={editedTranscript} rawTranscript={rawTranscript} onTranscriptChange={handleEditedTranscriptChange} minWords={transcriptMinimumWords[mode]} />
        <p className="mt-5 rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm leading-6 text-brand-800">{copy.audioFirstFeedback.note}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={getAudioFeedback} disabled={!audioBlob || isAudioEvaluating} className="rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50">{isAudioEvaluating ? copy.audioFirstFeedback.analyzing : copy.audioFirstFeedback.primary}</button>
          <button type="button" onClick={getTextFeedback} disabled={!transcriptIsLongEnough || isEvaluating} className="rounded-lg border border-brand-200 bg-white px-5 py-3 font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50">{isEvaluating ? copy.feedback.generating : copy.feedback.textOnly}</button>
        </div>
        {!audioBlob ? <p className="mt-3 text-sm text-slate-500">{copy.audioFirstFeedback.noAudio}</p> : null}
        {!transcriptIsLongEnough && editedTranscript.trim() ? <p className="mt-3 text-sm text-amber-700">{copy.feedback.addMoreDetail}</p> : null}
        {audioEvaluationError ? <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800">{audioEvaluationError}</p> : null}
        {evaluationError ? <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800">{evaluationError}</p> : null}
        {audioFeedback ? <AudioFeedbackReport result={audioFeedback} /> : null}
        {feedback ? <SpeakingFeedbackReport result={feedback} /> : null}
        {hasAnyFeedback ? <><SaveAttemptButton part={question.part} mode="single_question" topic={question.topic} question={getQuestionText(question)} rawTranscript={rawTranscript} editedTranscript={editedTranscript} textFeedback={feedback} audioFeedback={audioFeedback} /><PracticeActionPanel onRetry={retryQuestion} onNextQuestion={showNextQuestion} backHref={routes.practice} /><SessionSummaryCard attempts={flowState.attempts} /></> : null}
      </> : null}
      {!hasAnyFeedback ? <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><Link href={routes.practice} className="text-sm font-semibold text-brand-600 hover:text-brand-700">{copy.common.backToPracticeHub}</Link><button type="button" onClick={showNextQuestion} className="rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700">{copy.practice.nextQuestion}</button></div> : null}
    </div>
  )
}
