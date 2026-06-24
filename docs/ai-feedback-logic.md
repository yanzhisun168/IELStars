# BandMate AI — AI Feedback Logic

## Purpose and score disclaimer

The feedback service evaluates a user's spoken answer against IELTS Speaking-style expectations and returns practical coaching. Every score must be labelled **AI-estimated**. It is not an official IELTS result, does not guarantee a test outcome, and cannot replace assessment by an accredited IELTS examiner.

The system should be calibrated against public IELTS Speaking descriptors and curated benchmark responses, but should prefer helpful, evidence-based feedback over false precision.

## Evaluation inputs

The evaluation request should include:

- Practice mode and part (`part1`, `part2`, `part3`, or `full_mock`).
- Question text and, for Part 2, cue-card prompts.
- The final user-approved transcript.
- Audio-derived signals when available: duration, silence/hesitation indicators, speech rate, and pronunciation analysis.
- Optional context: previous answer feedback, target band, and whether the answer belongs to a mock test.

Transcript-only evaluation cannot reliably assess pronunciation. If usable audio pronunciation signals are unavailable, the API must state that pronunciation confidence is limited rather than inventing detailed pronunciation errors.

## Evaluation process

1. Validate input quality. Reject or request a retry for empty, extremely short, irrelevant, or unusable answers.
2. Identify task requirements: direct response for Part 1, coverage and development of cue-card points for Part 2, or reasoned discussion for Part 3.
3. Assess each of the four criteria independently using evidence from the transcript and audio signals.
4. Assign an AI-estimated criterion band and confidence level. Use 0.5 increments for presentation, while keeping internal reasoning flexible.
5. Derive the AI-estimated overall band from the four criteria, rounded to the nearest 0.5. For a Full Mock Test, aggregate across all answers with greater weight for sustained patterns than isolated mistakes.
6. Produce concise feedback: strengths, the most important improvements, corrected language, a suitable sample answer, and a next task tailored to the weakest high-impact area.
7. Run quality checks: feedback must match the question, avoid unsupported claims, avoid shaming language, and repeat the AI-estimate disclaimer.

## Four IELTS Speaking criteria

### 1. Fluency and Coherence

Assess the ability to keep speaking, organise ideas, answer the question directly, extend relevant points, and use linking language naturally. Consider excessive pauses, repetition, self-correction, and incomplete development. Do not penalise natural thinking pauses alone.

Feedback should identify one concrete organisation or delivery improvement, such as: “State your opinion first, then give one reason and an example.”

### 2. Lexical Resource

Assess range, precision, appropriacy, collocation, paraphrasing, and the ability to discuss the required topic. Reward accurate natural language over rare words used incorrectly. Flag repeated basic vocabulary only when a more precise alternative would improve the answer.

Feedback should give useful replacements in context, not long vocabulary lists.

### 3. Grammatical Range and Accuracy

Assess the variety and control of sentence structures, including simple and complex forms. Identify errors that affect clarity or occur repeatedly. Separate isolated slips from systematic patterns and preserve the speaker’s intended meaning in corrections.

Feedback should prioritise one or two recurring grammar patterns with corrected examples from the user’s own answer.

### 4. Pronunciation

Assess intelligibility, word stress, sentence stress, rhythm, connected speech, and sounds only when reliable audio analysis supports the observation. Accent is not itself an error. The goal is ease of understanding, not imitation of a particular native accent.

Feedback should be specific and actionable, for example: “Make the final /s/ audible in plural nouns such as ‘benefits’.” If confidence is low, say that pronunciation was not assessed reliably from the available audio.

## Scoring principles

- Give one overall estimate and four criterion estimates; do not claim exact examiner-level precision.
- Base claims on visible transcript evidence or supported audio evidence.
- Reward relevance and developed ideas; length alone is not quality.
- Do not reduce a score solely for Chinese accent, minor transcription errors, or one-off slips.
- Avoid diagnostic, personal, or comparative statements about intelligence, nationality, or personality.
- For low-confidence output, communicate uncertainty and suggest a retry rather than presenting a firm score.

## Expected feedback API JSON

```json
{
  "status": "completed",
  "disclaimer": "This is an AI-estimated IELTS Speaking score, not an official IELTS result.",
  "practice": {
    "mode": "single_question",
    "part": "part2",
    "question_id": "p2-describe-a-person-001",
    "question": "Describe a person who has helped you.",
    "target_band": 6.5
  },
  "transcript": {
    "text": "...",
    "user_edited": true,
    "confidence": 0.93
  },
  "score": {
    "overall_band_estimate": 6.0,
    "confidence": "medium",
    "criteria": {
      "fluency_and_coherence": 6.0,
      "lexical_resource": 6.0,
      "grammatical_range_and_accuracy": 5.5,
      "pronunciation": 6.5
    },
    "rationale": "The answer is relevant and understandable, but its ideas and sentence structures are not consistently developed."
  },
  "criteria_feedback": {
    "fluency_and_coherence": {
      "strength": "You give a clear main point and one relevant example.",
      "improvement": "Use a simple beginning-middle-end structure to develop the story.",
      "evidence": ["You move quickly from the introduction to the conclusion."]
    },
    "lexical_resource": {
      "strength": "You use topic-relevant words such as 'encourage' and 'advice'.",
      "improvement": "Replace repeated general words such as 'good' with more precise descriptions.",
      "evidence": ["'a very good teacher' could be 'a patient and motivating teacher'"]
    },
    "grammatical_range_and_accuracy": {
      "strength": "Most basic past-tense sentences are understandable.",
      "improvement": "Check third-person singular forms and add controlled complex sentences.",
      "evidence": ["'she help me' should be 'she helped me'"]
    },
    "pronunciation": {
      "strength": "The recording is generally intelligible.",
      "improvement": "Use stronger stress on key content words.",
      "evidence": ["Audio analysis indicates mostly even stress across phrases."],
      "assessment_confidence": "medium"
    }
  },
  "corrections": [
    {
      "original": "She help me to confidence.",
      "suggested": "She helped me become more confident.",
      "type": "grammar_and_collocation",
      "explanation": "Use past tense for a completed event and 'help someone become'."
    }
  ],
  "sample_answer": {
    "text": "...",
    "level": "around_band_6_5",
    "notes": ["Answers the prompt directly", "Uses a clear story structure"]
  },
  "next_task": {
    "type": "retry_with_structure",
    "instruction": "Try the same cue card again using: who the person is, what they did, and why it mattered.",
    "question_id": "p2-describe-a-person-001"
  },
  "quality_flags": []
}
```

For non-completed evaluations, return `status: "needs_retry"` with a human-readable reason and no score. Examples include `audio_too_short`, `no_speech_detected`, and `transcript_low_confidence`.

## Feedback examples

### Example: Part 1

**Question:** “Do you enjoy cooking?”

**User answer:** “Yes, I like cooking because it is interesting. I cook noodles at weekend. My mother teach me and it makes me happy.”

**AI-estimated result:** Overall 5.5. The answer is direct and understandable, but it needs one more developed detail and more accurate verb forms.

**Useful feedback:** “Add a specific example after your main answer: say what noodles you make and why you enjoy making them. Correct ‘I cook noodles at weekend’ to ‘I cook noodles at the weekend,’ and ‘My mother taught me.’ Try ‘relaxing’ or ‘rewarding’ instead of repeating ‘interesting.’”

### Example: Part 3

**Question:** “Why do some people prefer to work from home?”

**User answer:** “Because it is convenient. They can save time. But sometimes it is not good because they feel lonely.”

**AI-estimated result:** Overall 5.5. The response gives two relevant points but needs clearer reasoning and a developed example.

**Useful feedback:** “State the reason, explain its effect, then add an example. For instance: ‘Many people prefer working from home because they avoid long commutes, which gives them more time for family or exercise.’ Then contrast it with the risk of isolation.”
