# BandMate AI — Product Requirements

## Product positioning

BandMate AI is a web-based IELTS Speaking practice assistant for Chinese test takers. It turns spoken practice into fast, structured feedback: users answer realistic IELTS-style questions by voice, receive a transcript and an AI-estimated band score, understand how to improve against IELTS Speaking criteria, and continue with a targeted next task.

The MVP is a focused practice and feedback product, not an official test-preparation course or a replacement for a qualified IELTS examiner.

## Target user

Primary users are Chinese IELTS candidates who:

- Are preparing for IELTS Academic or General Training and need to improve speaking.
- Have roughly CEFR A2–C1 English ability (commonly IELTS band 4.0–7.0 goals).
- Want private, repeatable speaking practice outside class.
- Need concrete feedback but cannot regularly access an English teacher or speaking partner.
- Prefer clear explanations and guidance that are easy to act on; the practice content itself remains in English.

## Main pain points

- Speaking practice is difficult to do alone and live tutoring is expensive or inconvenient.
- Learners often know vocabulary and grammar rules but cannot use them smoothly under time pressure.
- Generic feedback such as “speak more fluently” does not show what to change next.
- Learners are unsure how their current performance maps to IELTS Speaking expectations.
- Practice is fragmented: recording, transcription, correction, sample answers, and progress tracking happen in separate tools.

## MVP scope

The first version includes:

- IELTS Speaking Part 1, Part 2, and Part 3 question practice from a curated question bank.
- A Full Mock Test flow that sequences Parts 1–3.
- In-browser voice recording and playback.
- Speech-to-text transcription with an editable transcript before evaluation.
- AI-generated, criterion-based feedback for each answer:
  - AI-estimated overall and criterion band scores.
  - Strengths and priority improvements.
  - Grammar and vocabulary corrections.
  - A better sample answer appropriate to the prompt.
  - A suggested next practice task.
- User accounts and a basic practice history.
- A simple progress dashboard showing recent practice and score trends.
- Free and Pro plans with clearly enforced usage limits.

## Out of scope for V1

- Official IELTS scoring, score guarantees, or examiner certification.
- Live human tutoring, examiner matching, or community speaking rooms.
- Full IELTS Listening, Reading, or Writing preparation.
- Native mobile apps, offline mode, or social sharing features.
- Open-ended AI conversation outside the defined practice flows.
- Advanced pronunciation visualisations such as phoneme heatmaps or real-time accent coaching.
- Complex study plans, gamification systems, referral programs, and multi-language product localisation.
- Enterprise, school, or teacher management features.

## Main success metrics

### Activation

- Percentage of new users who complete one evaluated answer in their first session.
- Time from landing-page entry to first feedback result.

### Engagement

- Evaluated answers per active user per week.
- Percentage of active users who return to practice within seven days.
- Full Mock Test completion rate.

### Product value

- Percentage of users who start the recommended next task after feedback.
- User-rated helpfulness of feedback.
- Percentage of users whose estimated score trend improves after repeated practice.

### Monetisation

- Free-to-Pro conversion rate.
- Pro retention and paid evaluation usage.

### Quality guardrails

- Transcription failure rate.
- AI feedback generation failure rate and median feedback latency.
- Frequency of user-reported inaccurate or unhelpful feedback.
