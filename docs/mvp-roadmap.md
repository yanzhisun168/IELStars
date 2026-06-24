# BandMate AI — MVP Roadmap

This roadmap keeps the MVP deliberately narrow: prove that Chinese IELTS candidates can record a response, receive useful AI feedback, and return to practise again.

## 0. Product documentation

- Create and agree the product requirements, user flows, AI feedback logic, and MVP roadmap.
- Define the initial question types, feedback quality bar, free-plan limits, and Pro value proposition.
- Exit criteria: documentation is approved and V1 scope is stable.

## 1. Next.js project setup

- Initialise the Next.js web application and core layout.
- Add environment configuration, basic design tokens, error handling, and deployment-ready scripts.
- Create placeholder routes for landing, practice, results, history, dashboard, and pricing.
- Exit criteria: the app runs locally and production build checks pass.

## 2. Question bank

- Build a curated, versioned IELTS Speaking-style question bank for Parts 1, 2, and 3.
- Store metadata: part, topic, prompt, Part 2 bullet points, recommended duration, and related questions.
- Start with a small quality-controlled set rather than attempting broad coverage.
- Exit criteria: users can browse or receive valid questions for every practice mode.

## 3. Voice recording

- Implement browser microphone permission, recording, stop/retry, playback, and upload.
- Handle silent, too-short, and failed recordings clearly.
- Optimise for current desktop and mobile browsers without promising full offline support.
- Exit criteria: a user can reliably record and replay an answer on supported browsers.

## 4. Speech-to-text transcription

- Send recorded audio to a speech-to-text provider.
- Display transcription state, confidence where available, and an editable result.
- Save the user-approved transcript with the attempt.
- Exit criteria: a recorded answer produces an editable transcript with recoverable failure handling.

## 5. AI speaking evaluation

- Implement the feedback API using the schema in `ai-feedback-logic.md`.
- Evaluate Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, and Pronunciation where audio evidence supports it.
- Return estimated scores, corrections, sample answer, next task, disclaimer, and quality flags.
- Add prompt and response validation plus basic evaluation test cases.
- Exit criteria: representative answers produce structured, useful feedback without unsupported scoring claims.

## 6. Complete practice flow

- Connect question selection, recording, transcription, transcript edit, evaluation, and results.
- Implement Part 1, Part 2, Part 3, and a sequential Full Mock Test flow.
- Ensure results provide retry and next-task actions.
- Exit criteria: a new visitor can complete an end-to-end evaluated practice session.

## 7. User login and practice history

- Add authentication and a user profile.
- Persist attempts, transcripts, scores, feedback, and mock-test reports.
- Build a simple history page with attempt details and retry links.
- Exit criteria: signed-in users can safely return to previous results and continue practising.

## 8. Progress dashboard

- Show recent activity, estimated score trend, criterion trends, and recurring improvement areas.
- Keep charts and explanations simple; indicate when data is insufficient for a meaningful trend.
- Exit criteria: returning users can understand what they have practised and what to focus on next.

## 9. Free vs Pro monetisation page

- Define free quotas and Pro entitlements in configuration.
- Build a pricing and upgrade page that clearly explains limits and value.
- Enforce usage limits before evaluation and avoid charging quota for technical failures.
- Add payment integration only after the upgrade experience and plan rules are ready.
- Exit criteria: users can see their plan, remaining allowance, upgrade path, and correctly enforced access.

## 10. Deployment

- Configure production environment variables, hosting, domain, error monitoring, and analytics.
- Run security, privacy, accessibility, performance, and end-to-end checks.
- Publish a limited beta, monitor feedback quality and failure rates, and iterate before wider release.
- Exit criteria: a monitored production MVP is available to beta users with a rollback plan.

## Suggested delivery order

Stages 1–6 establish the core value loop. Stage 7 makes it repeatable, Stage 8 makes progress visible, Stage 9 tests sustainable monetisation, and Stage 10 releases the product safely. Do not expand scope until the core loop has reliable transcription, credible feedback, and repeat use.
