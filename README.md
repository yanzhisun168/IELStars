# BandMate AI

BandMate AI is an IELTS Speaking practice web app for Chinese IELTS test takers. It guides learners through a local practice loop: question, recording, transcript editing, AI feedback, and the next action.

## Current project status

- Stage 1: Next.js App Router foundation — complete.
- Stage 2: Local IELTS Speaking question bank and Full Mock flow — complete.
- Stage 3: Browser audio recording and local playback — complete.
- Stage 4: Free browser transcription through the Web Speech API — complete.
- Stage 5: DeepSeek-powered AI-estimated Speaking feedback — complete.
- Stage 6: Complete local practice flow, actions, and session summaries — complete.
- Stage 6.5: Simplified Chinese UI localization and Chinese-first AI feedback — complete.
- Stages 7 and 8: Login, saved history, and long-term dashboard trends — planned.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then choose a practice mode from `/practice`.

## Configure DeepSeek evaluation

Create `.env.local` in the project root. Keep this file private and never use a `NEXT_PUBLIC_` prefix for the API key.

```bash
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

Restart the development server after changing `.env.local`. The key is used only by the server-side evaluation route and never reaches browser code.

## Stage 5.5: Gemini audio-first evaluation

Gemini audio-first evaluation uses the actual browser recording as the primary evidence. It can assess delivery features that transcript-only feedback cannot reliably judge, including pauses, hesitation, repetition, speech rate, rhythm, intelligibility, and pronunciation clarity.

The app keeps two feedback paths:

- **DeepSeek text-only feedback** analyses the editable transcript. It is useful for reviewing wording, grammar, and vocabulary.
- **Gemini audio-first feedback** analyses the actual recording. The browser-generated transcript is supporting context; an edited transcript is only used to understand intended meaning and never raises the audio-first score.

Add both providers to `.env.local` when you want to use both feedback paths:

```bash
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Restart `npm run dev` after changing environment variables. `GEMINI_API_KEY` is read only by `app/api/evaluate-speaking-audio/route.ts`; it is never sent to browser code. Audio is sent to Gemini for the request and is not stored by this app.

### Test audio-first feedback

1. Open a Part 1, Part 2, Part 3, or Full Mock practice page.
2. Record a spoken answer and stop the recorder. Check that the audio player can play the recording.
3. Optionally generate a browser transcript. Avoid manually beautifying it before comparing feedback.
4. Click **获取录音客观反馈**. The button is enabled only after an audio recording exists.
5. Confirm that the report includes the audio estimated band, audio evidence, four IELTS-style criteria, corrections, a better English sample answer, and a next practice task.
6. In Full Mock, use Previous and Next to confirm that each step retains its recording-derived feedback. At the end, confirm the completed screen shows the count and average score of audio-first feedback.

All scores are AI-estimated learning guidance, not official IELTS results.

## Complete local practice flow

Every practice mode follows the same local-only sequence:

1. Read the question.
2. Record an answer and/or start browser transcription.
3. Review and edit the transcript.
4. Request DeepSeek AI feedback.
5. Retry, continue to the next question, or return to the Practice Hub.

Session summaries and Full Mock feedback exist only in the active browser session. No database or user account is used yet.

## Stage 6.5 localization

The product UI is localized for Simplified Chinese users through `lib/i18n`. IELTS questions, cue-card prompts, and bullet points remain English. AI feedback explanations are Chinese-first, while English corrections and improved sample answers remain English for learning value. Code, component names, and TypeScript types remain English. Future language options can use the same `lib/i18n` structure.

## Test the practice flows

### Part 1, Part 2, and Part 3

1. Open the selected practice page from `/practice`.
2. Follow the progress indicator from question through recording and transcript editing.
3. Add enough transcript text to enable **Get AI feedback**.
4. Review the feedback report, then use **Retry this question** or **Next question**.
5. Confirm the local session summary updates after feedback.

### Full Mock Test

1. Open `/practice/full-mock`.
2. Complete the seven steps: three Part 1 questions, one Part 2 cue card, and three Part 3 questions.
3. Request feedback on any step, then navigate with **Previous** and **Next** to confirm each transcript and feedback report remains available.
4. Finish the mock to view its local session summary, review previous answers, or generate a new mock.

## Stage 7: Supabase authentication and practice history

Stage 7 saves completed practice attempts after the user explicitly chooses **保存到历史记录**. Saved data includes question metadata, raw and edited transcripts, completed text/audio feedback, derived scores, and timestamps. Raw audio files are deliberately **not** uploaded or stored in this stage.

### Supabase setup

1. Create a Supabase project and enable Email/Password authentication.
2. Open the Supabase SQL Editor and run the full contents of `supabase/schema.sql`.
3. Add these values to `.env.local`, then restart `npm run dev`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_MODEL_PRIMARY=gemini-2.5-flash
GEMINI_MODEL_FALLBACK=gemini-2.5-flash-lite
```

Never expose `SUPABASE_SERVICE_ROLE_KEY`: it is used only by the server-side `/api/practice-attempts` route. The browser sends the signed-in user's access token to that route; the route verifies it before reading or writing only that user's records.

### Email confirmation and redirect URLs

Configure Supabase before asking external users to register:

1. In **Supabase Dashboard → Authentication → URL Configuration**, set **Site URL** to the deployed site URL.
2. Add redirect URLs for the production domain with `/**`, for example `https://your-domain.example/**`.
3. Add the local development URL `http://localhost:3000/**`.
4. If testing through a temporary server IP address, add that IP URL with `/**`, for example `http://203.0.113.10/**`.

The registration page sends each confirmation email back to `${window.location.origin}/auth/login?confirmed=1`, so the same code works locally and in production. Old confirmation emails may still contain an old redirect URL. After changing Supabase URL Configuration, users should register again or request a new confirmation email.

### Test Stage 7

1. Open `/auth`, register an email/password account, and log in. Verify the email first if Email Confirmations are enabled.
2. Complete a Part 1, Part 2, Part 3, or Full Mock step and generate text and/or audio feedback.
3. Click **保存到历史记录**. The record does not contain an audio file.
4. Open `/history` to review the saved card and its expandable details.
5. Open `/dashboard` to view total saved attempts, average band, latest score, and strongest/weakest criteria.

### Stage 7 troubleshooting

- **保存按钮没有出现**：先完成“仅分析文本反馈”或“获取录音客观反馈”中的至少一种；按钮会显示在反馈报告下方。
- **保存失败**：确认 `.env.local` 中的 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 正确，并在修改后重启 `npm run dev`。
- **历史记录为空**：确认当前用户已登录，并已在 Supabase SQL Editor 运行 `supabase/schema.sql`，特别是 `practice_attempts` 的 RLS 策略。
- **隐私说明**：Stage 7 不上传或保存音频文件，只保存题目、转写、反馈 JSON、分数和时间。

## Stage 8: Progress dashboard

The dashboard reads the signed-in user's saved `practice_attempts` records from Supabase and calculates all statistics in the browser. It does not use a separate analytics database and does not save audio files.

It shows total attempts, average/latest/highest estimated band, feedback-source counts, criterion averages, recent saved scores, practice coverage by part, and a practical recommendation based on the weakest available criterion.

### Test the dashboard

1. Log in and save several completed Part 1, Part 2, Part 3, or Full Mock step attempts.
2. Open `/dashboard`.
3. Check the summary cards, four-criterion averages, latest seven saved scores, part counts, and next recommendation.
4. Use `/history` and select **查看进度面板** to return to the dashboard.

## Post-recording transcription and separate authentication pages

Live browser transcription remains available as an optional real-time helper. After a recording has ended, learners can now choose **从录音生成文本**. The recording is sent to the server-side Gemini route for a close-to-verbatim English transcript; it is not stored and Gemini does not receive the API key from the browser.

- Log in at `/auth/login`.
- Create a new account at `/auth/register`.
- After successful registration, the app returns to the login page. If Supabase email confirmation is enabled, verify the email before logging in.

## Notes

- Browser transcription support varies; Chrome is recommended, and transcripts can always be typed manually.
- Scores are AI-estimated guidance, not official IELTS results.
- Stage 5 is transcript-based, so pronunciation feedback has limited confidence.
- Saved attempts are scoped to the signed-in user. Audio files are not stored in Stage 7.
