# BandMate AI — User Flow

## Core journey: landing page to AI feedback

1. The visitor lands on BandMate AI and sees the value proposition: practise IELTS Speaking by voice and get criterion-based AI feedback.
2. The visitor chooses **Try a question** or signs in. A short free preview may be available before sign-in; saving history requires an account.
3. The user selects a practice mode: Part 1, Part 2, Part 3, or Full Mock Test.
4. The app shows the question, instructions, recommended response time, and recording controls.
5. The user grants microphone permission, records an answer, then stops and reviews playback.
6. The app transcribes the recording. The user can correct obvious transcription errors before submitting.
7. The user submits the answer for evaluation.
8. The app returns an AI feedback report with the transcript, AI-estimated score, feedback on four criteria, corrections, a sample answer, and a next practice task.
9. The user starts the suggested next task, retries the same question, or returns to the practice hub. Signed-in users can review the result in history.

## Part 1 flow

Part 1 is short, familiar-topic practice.

1. User chooses a topic such as Home, Work, Studies, Hobbies, or Daily Routine.
2. The app presents one short question and a suggested response time of about 15–30 seconds.
3. User records, checks the transcript, and submits.
4. The feedback emphasises direct answers, natural expansion, basic fluency, and accurate everyday language.
5. The next task either asks another question from the same topic or targets the weakest criterion.

## Part 2 flow

Part 2 is cue-card practice.

1. User selects a cue card or receives one at random.
2. The app shows the topic, bullet prompts, one-minute preparation guidance, and a suggested 1–2 minute response target.
3. User prepares, records the long turn, checks the transcript, and submits.
4. The feedback assesses organisation, development of ideas, storytelling/detail, range of language, grammar, and speech clarity.
5. The next task may be a retry with a better structure, a related Part 3 question, or a focused language drill.

## Part 3 flow

Part 3 is abstract discussion practice.

1. User chooses a topic or enters from a related Part 2 result.
2. The app asks an opinion, comparison, cause-and-effect, or future-focused question.
3. User records a response of roughly 40–90 seconds, reviews the transcript, and submits.
4. The feedback prioritises clear reasoning, development with examples, nuanced vocabulary, and complex but controlled grammar.
5. The next task asks a follow-up question or targets an identified weakness.

## Full Mock Test flow

1. User selects **Full Mock Test** and reviews the approximate sequence and duration.
2. The app runs a fixed, examiner-like sequence:
   - Part 1: several short questions.
   - Part 2: one cue card with preparation time and a long turn.
   - Part 3: several discussion questions linked to the Part 2 theme.
3. The user records each answer in sequence. They can review transcription before final submission; the MVP does not simulate a live examiner interruption.
4. After the final answer, the app creates a consolidated report with section-level feedback, overall estimated performance, recurring issues, and the highest-priority next task.
5. The completed mock is saved to history for signed-in users.

## Free and Pro experience

| Area | Free user | Pro user |
| --- | --- | --- |
| Access | Can try core practice modes | Full access to all core practice modes |
| Evaluations | Limited AI evaluations per defined period | Higher or unlimited fair-use evaluation allowance |
| Question bank | Curated starter set | Full available question bank |
| Feedback | Core score and improvement points | Full detailed feedback, corrections, sample answer, and next task |
| Full Mock Test | Limited preview or limited attempts | Full mock tests and saved reports |
| History and progress | Limited recent history | Extended history and progress trends |

Exact quotas, fair-use limits, and pricing are product configuration decisions. They should be displayed before an evaluation is consumed and on the upgrade page.

## Key edge states

- If microphone permission is denied, explain how to enable it and allow the user to retry.
- If audio is too short, silent, or unclear, request a re-recording instead of producing a misleading score.
- If transcription confidence is low, prominently ask the user to edit the transcript before evaluation.
- If an evaluation fails, preserve the recording and transcript where possible and provide a retry action without double-charging the user’s quota.
- If a free user reaches a limit, show the remaining reset timing and a clear Pro upgrade path.
