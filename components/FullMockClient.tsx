'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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
import type { MockStepState, PracticeAttempt, PracticeStepStatus } from '@/lib/practiceFlowTypes'
import { createFullMockTest } from '@/lib/questionBank'
import { routes } from '@/lib/routes'
import { countWords } from '@/lib/textStats'
import type { FullMockTest, Part1Question, Part2CueCard, Part3Question } from '@/lib/types'

type MockQuestion = Part1Question | Part2CueCard | Part3Question
type CompletedTextFeedback = Extract<SpeakingEvaluationResult, { status: 'completed' }>
type CompletedAudioFeedback = Extract<AudioSpeakingEvaluationResult, { status: 'completed' }>
type MockStep = { question: MockQuestion; label: string }

const recordingSettings = {
  part1: { maxDurationSeconds: 45, minDurationSeconds: 8 },
  part2: { maxDurationSeconds: 120, minDurationSeconds: 45 },
  part3: { maxDurationSeconds: 90, minDurationSeconds: 20 },
} as const
const transcriptMinimumWords = { part1: 15, part2: 70, part3: 35 } as const

function buildSteps(mockTest: FullMockTest): MockStep[] {
  return [
    ...mockTest.part1Questions.map((question, index) => ({ question, label: `Part 1 Question ${index + 1}` })),
    { question: mockTest.part2CueCard, label: 'Part 2 Cue Card' },
    ...mockTest.part3Questions.map((question, index) => ({ question, label: `Part 3 Discussion ${index + 1}` })),
  ]
}

function getQuestionText(question: MockQuestion): string {
  return question.part === 'part2' ? [question.title, question.prompt, ...question.bulletPoints].join('\n') : question.question
}

function withoutKey<T>(record: Record<string, T>, key: string): Record<string, T> {
  const next = { ...record }
  delete next[key]
  return next
}

export function FullMockClient() {
  const [mockTest, setMockTest] = useState<FullMockTest | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [rawTranscriptsByStep, setRawTranscriptsByStep] = useState<Record<string, string>>({})
  const [editedTranscriptsByStep, setEditedTranscriptsByStep] = useState<Record<string, string>>({})
  const [audioBlobsByStep, setAudioBlobsByStep] = useState<Record<string, Blob>>({})
  const [feedbackByStep, setFeedbackByStep] = useState<Record<string, CompletedTextFeedback>>({})
  const [audioFeedbackByStep, setAudioFeedbackByStep] = useState<Record<string, CompletedAudioFeedback>>({})
  const [evaluationErrorsByStep, setEvaluationErrorsByStep] = useState<Record<string, string>>({})
  const [audioEvaluationErrorsByStep, setAudioEvaluationErrorsByStep] = useState<Record<string, string>>({})
  const [evaluatingStepKey, setEvaluatingStepKey] = useState<string | null>(null)
  const [audioEvaluatingStepKey, setAudioEvaluatingStepKey] = useState<string | null>(null)
  const [stepStatesByKey, setStepStatesByKey] = useState<Record<string, MockStepState>>({})
  const [resetVersionsByStep, setResetVersionsByStep] = useState<Record<string, number>>({})
  const editedManuallyRef = useRef<Record<string, boolean>>({})

  useEffect(() => {
    const timer = window.setTimeout(() => setMockTest(createFullMockTest()), 0)
    return () => window.clearTimeout(timer)
  }, [])

  const steps = useMemo(() => mockTest ? buildSteps(mockTest) : [], [mockTest])
  const currentStep = steps[currentIndex]
  const currentStepKey = mockTest ? `${mockTest.id}-${currentIndex}` : ''
  const currentTranscript = editedTranscriptsByStep[currentStepKey] ?? ''
  const currentAudioBlob = audioBlobsByStep[currentStepKey]
  const currentFeedback = feedbackByStep[currentStepKey]
  const currentAudioFeedback = audioFeedbackByStep[currentStepKey]
  const currentEvaluationError = evaluationErrorsByStep[currentStepKey]
  const currentAudioEvaluationError = audioEvaluationErrorsByStep[currentStepKey]
  const hasCurrentFeedback = Boolean(currentFeedback || currentAudioFeedback)
  const currentFlowStep: PracticeStepStatus = stepStatesByKey[currentStepKey]?.status ?? (hasCurrentFeedback ? 'feedback' : currentTranscript.trim() ? 'transcript' : 'question')
  const resetKey = `${currentStepKey}-${resetVersionsByStep[currentStepKey] ?? 0}`

  const sessionAttempts = useMemo<PracticeAttempt[]>(() => steps.flatMap((step, index) => {
    const key = mockTest ? `${mockTest.id}-${index}` : ''
    const result = audioFeedbackByStep[key] ?? feedbackByStep[key]
    if (!result) return []
    return [{ id: key, part: step.question.part, topic: step.question.topic, question: getQuestionText(step.question), transcript: editedTranscriptsByStep[key] ?? '', estimatedBand: result.estimatedBand, completedAt: new Date().toISOString(), hasFeedback: true, criteria: result.criteria }]
  }), [audioFeedbackByStep, editedTranscriptsByStep, feedbackByStep, mockTest, steps])

  const audioFeedbackResults = useMemo(() => Object.values(audioFeedbackByStep), [audioFeedbackByStep])
  const audioAverageBand = audioFeedbackResults.length ? audioFeedbackResults.reduce((total, result) => total + result.estimatedBand, 0) / audioFeedbackResults.length : null

  const updateStepStatus = useCallback((status: PracticeStepStatus) => {
    if (!currentStepKey) return
    setStepStatesByKey((states) => {
      const previous = states[currentStepKey]
      if (previous?.status === status) return states
      return { ...states, [currentStepKey]: { stepIndex: currentIndex, status, transcript: previous?.transcript ?? '', feedback: previous?.feedback } }
    })
  }, [currentIndex, currentStepKey])

  const updateCurrentTranscript = useCallback((value: string, isManualEdit = false) => {
    if (!currentStepKey) return
    if (isManualEdit) editedManuallyRef.current[currentStepKey] = true
    setEditedTranscriptsByStep((transcripts) => ({ ...transcripts, [currentStepKey]: value }))
    setStepStatesByKey((states) => {
      const previous = states[currentStepKey]
      return { ...states, [currentStepKey]: { stepIndex: currentIndex, status: hasCurrentFeedback ? 'feedback' : value.trim() ? 'transcript' : 'question', transcript: value, feedback: previous?.feedback } }
    })
  }, [currentIndex, currentStepKey, hasCurrentFeedback])

  const handleRawTranscriptChange = useCallback((value: string) => {
    if (!currentStepKey) return
    setRawTranscriptsByStep((transcripts) => ({ ...transcripts, [currentStepKey]: value }))
    if (!editedManuallyRef.current[currentStepKey]) updateCurrentTranscript(value)
  }, [currentStepKey, updateCurrentTranscript])

  const handleRecordedRawTranscript = useCallback((value: string) => {
    if (!currentStepKey) return
    setRawTranscriptsByStep((transcripts) => ({ ...transcripts, [currentStepKey]: value }))
  }, [currentStepKey])

  const handleRecordedTranscript = useCallback((value: string) => {
    if (!currentStepKey) return
    editedManuallyRef.current[currentStepKey] = true
    updateCurrentTranscript(value)
  }, [currentStepKey, updateCurrentTranscript])

  function handleRecordingStateChange(isRecording: boolean) {
    if (evaluatingStepKey === currentStepKey || audioEvaluatingStepKey === currentStepKey) return
    updateStepStatus(isRecording ? 'recording' : currentTranscript.trim() ? 'transcript' : 'question')
  }

  function generateNewMockTest() {
    editedManuallyRef.current = {}
    setMockTest(createFullMockTest())
    setCurrentIndex(0)
    setIsComplete(false)
    setRawTranscriptsByStep({})
    setEditedTranscriptsByStep({})
    setAudioBlobsByStep({})
    setFeedbackByStep({})
    setAudioFeedbackByStep({})
    setEvaluationErrorsByStep({})
    setAudioEvaluationErrorsByStep({})
    setEvaluatingStepKey(null)
    setAudioEvaluatingStepKey(null)
    setStepStatesByKey({})
    setResetVersionsByStep({})
  }

  function moveNext() {
    if (currentIndex === steps.length - 1) { setIsComplete(true); return }
    setCurrentIndex((index) => index + 1)
  }

  function movePrevious() {
    if (isComplete) setIsComplete(false)
    setCurrentIndex((index) => Math.max(0, index - 1))
  }

  function retryCurrentStep() {
    if (!currentStepKey) return
    editedManuallyRef.current[currentStepKey] = false
    setRawTranscriptsByStep((items) => withoutKey(items, currentStepKey))
    setEditedTranscriptsByStep((items) => withoutKey(items, currentStepKey))
    setAudioBlobsByStep((items) => withoutKey(items, currentStepKey))
    setFeedbackByStep((items) => withoutKey(items, currentStepKey))
    setAudioFeedbackByStep((items) => withoutKey(items, currentStepKey))
    setEvaluationErrorsByStep((items) => withoutKey(items, currentStepKey))
    setAudioEvaluationErrorsByStep((items) => withoutKey(items, currentStepKey))
    setStepStatesByKey((states) => ({ ...states, [currentStepKey]: { stepIndex: currentIndex, status: 'question', transcript: '' } }))
    setResetVersionsByStep((versions) => ({ ...versions, [currentStepKey]: (versions[currentStepKey] ?? 0) + 1 }))
  }

  async function getTextFeedback() {
    if (!currentStep || !currentStepKey) return
    setEvaluatingStepKey(currentStepKey)
    updateStepStatus('feedback')
    setEvaluationErrorsByStep((items) => withoutKey(items, currentStepKey))
    const result = await evaluateSpeakingAnswer({ part: currentStep.question.part, question: getQuestionText(currentStep.question), topic: currentStep.question.topic, transcript: currentTranscript, mode: 'full_mock' })
    setEvaluatingStepKey(null)
    if (result.status === 'failed') { setEvaluationErrorsByStep((items) => ({ ...items, [currentStepKey]: result.error })); updateStepStatus('transcript'); return }
    setFeedbackByStep((items) => ({ ...items, [currentStepKey]: result }))
    setStepStatesByKey((states) => ({ ...states, [currentStepKey]: { stepIndex: currentIndex, status: 'feedback', transcript: currentTranscript, feedback: result } }))
  }

  async function getAudioFeedback() {
    if (!currentStep || !currentStepKey || !currentAudioBlob) return
    setAudioEvaluatingStepKey(currentStepKey)
    updateStepStatus('feedback')
    setAudioEvaluationErrorsByStep((items) => withoutKey(items, currentStepKey))
    const result = await evaluateSpeakingAudio({ audioBlob: currentAudioBlob, part: currentStep.question.part, question: getQuestionText(currentStep.question), topic: currentStep.question.topic, rawTranscript: rawTranscriptsByStep[currentStepKey] ?? '', editedTranscript: currentTranscript, mode: 'full_mock' })
    setAudioEvaluatingStepKey(null)
    if (result.status === 'failed') { setAudioEvaluationErrorsByStep((items) => ({ ...items, [currentStepKey]: result.error })); updateStepStatus('transcript'); return }
    setAudioFeedbackByStep((items) => ({ ...items, [currentStepKey]: result }))
    updateStepStatus('feedback')
  }

  function reviewPreviousAnswers() { setIsComplete(false); setCurrentIndex(Math.max(0, steps.length - 1)) }

  if (!mockTest || !currentStep) return <div className="mt-10 h-80 animate-pulse rounded-2xl bg-slate-200" aria-label="Creating your mock test" />

  return (
    <div className="mt-10">
      <PracticeProgressSteps currentStep={isComplete ? 'completed' : currentFlowStep} />
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-semibold text-brand-600">{isComplete ? copy.practice.mockComplete : `${copy.practice.stepOf(currentIndex + 1, steps.length)} · ${currentStep.label}`}</p><p className="text-sm text-slate-500">{isComplete ? '回顾之前的回答，或开始一套新的模拟题。' : currentStep.question.topic}</p></div>
      {isComplete ? <>
        <div className="rounded-2xl border border-brand-100 bg-brand-50 p-8"><h2 className="text-2xl font-semibold text-ink">你已完成本次完整模拟。</h2><p className="mt-3 leading-7 text-slate-600">每题反馈均可回顾。{copy.practice.mockReportLater}</p><p className="mt-3 text-sm leading-6 text-brand-800">你可以保存每一道题的反馈记录，完整模拟报告将在后续版本加入。</p></div>
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-700">录音客观反馈：{audioFeedbackResults.length} 题{audioAverageBand === null ? '（暂无平均分）' : ` · 平均 AI 预估分 ${audioAverageBand.toFixed(1)}`}</div>
        <SessionSummaryCard attempts={sessionAttempts} />
        <div className="mt-6 grid gap-3 sm:grid-cols-3"><button type="button" onClick={reviewPreviousAnswers} className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">{copy.practice.reviewPreviousAnswers}</button><button type="button" onClick={generateNewMockTest} className="rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700">{copy.practice.generateNewMock}</button><Link href={routes.practice} className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50">{copy.common.backToPracticeHub}</Link></div>
      </> : <>
        <QuestionCard question={currentStep.question} />
        <VoiceRecorder {...recordingSettings[currentStep.question.part]} resetKey={resetKey} onRecordingComplete={(blob) => setAudioBlobsByStep((items) => ({ ...items, [currentStepKey]: blob }))} onRecordingStateChange={handleRecordingStateChange} />
        <PostRecordingTranscriber audioBlob={currentAudioBlob ?? null} part={currentStep.question.part} question={getQuestionText(currentStep.question)} topic={currentStep.question.topic} onRawTranscriptGenerated={handleRecordedRawTranscript} onTranscriptGenerated={handleRecordedTranscript} resetKey={resetKey} />
        <BrowserSpeechTranscriber onTranscriptUpdate={handleRawTranscriptChange} resetKey={resetKey} />
        <TranscriptEditor transcript={currentTranscript} rawTranscript={rawTranscriptsByStep[currentStepKey]} onTranscriptChange={(value) => updateCurrentTranscript(value, true)} minWords={transcriptMinimumWords[currentStep.question.part]} />
        <p className="mt-5 rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm leading-6 text-brand-800">{copy.audioFirstFeedback.note}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><button type="button" onClick={getAudioFeedback} disabled={!currentAudioBlob || audioEvaluatingStepKey === currentStepKey} className="rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50">{audioEvaluatingStepKey === currentStepKey ? copy.audioFirstFeedback.analyzing : copy.audioFirstFeedback.primary}</button><button type="button" onClick={getTextFeedback} disabled={countWords(currentTranscript) < transcriptMinimumWords[currentStep.question.part] || evaluatingStepKey === currentStepKey} className="rounded-lg border border-brand-200 bg-white px-5 py-3 font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50">{evaluatingStepKey === currentStepKey ? copy.feedback.generating : copy.feedback.textOnly}</button></div>
        {!currentAudioBlob ? <p className="mt-3 text-sm text-slate-500">{copy.audioFirstFeedback.noAudio}</p> : null}
        {currentAudioEvaluationError ? <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800">{currentAudioEvaluationError}</p> : null}
        {currentEvaluationError ? <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800">{currentEvaluationError}</p> : null}
        {currentAudioFeedback ? <AudioFeedbackReport result={currentAudioFeedback} /> : null}
        {currentFeedback ? <SpeakingFeedbackReport result={currentFeedback} /> : null}
        {hasCurrentFeedback ? <><SaveAttemptButton part={currentStep.question.part} mode="full_mock" topic={currentStep.question.topic} question={getQuestionText(currentStep.question)} rawTranscript={rawTranscriptsByStep[currentStepKey] ?? ''} editedTranscript={currentTranscript} textFeedback={currentFeedback} audioFeedback={currentAudioFeedback} /><PracticeActionPanel onRetry={retryCurrentStep} onNextQuestion={moveNext} backHref={routes.practice} /></> : null}
      </>}
      {!isComplete ? <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]"><button type="button" onClick={movePrevious} disabled={currentIndex === 0} className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">{copy.practice.previous}</button><button type="button" onClick={moveNext} className="rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700">{currentIndex === steps.length - 1 ? copy.practice.finishMock : copy.practice.nextQuestion}</button><button type="button" onClick={generateNewMockTest} className="rounded-lg border border-brand-200 bg-white px-5 py-3 font-semibold text-brand-700 transition hover:bg-brand-50">{copy.practice.generateNewMock}</button></div> : null}
      {!isComplete ? <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm leading-6 text-brand-800">{copy.practice.temporarySession}</div> : null}
    </div>
  )
}
