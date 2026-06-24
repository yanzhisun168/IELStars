export function buildAudioTranscriptionPrompt(meta: { part?: string; question?: string; topic?: string }): string {
  return `你是一名严谨的英语口语转写员。请转写音频中用户实际说出的英文回答。

要求：
- 只根据实际音频转写，不要润色、改写、纠正语法或改善表达。
- 尽量保留可检测到的 um、uh、er、重复词、假起步和自我修正。
- 不要翻译成中文。
- 转写应尽可能贴近用户实际说出的内容。
- 若音频静音、太短、噪音过多或无法可靠识别，返回 status 为 failed。
- 仅返回有效 JSON，不要 Markdown，也不要 JSON 以外的文字。

练习部分：${meta.part ?? '未提供'}
主题：${meta.topic ?? '未提供'}
题目：${meta.question ?? '未提供'}

成功时严格返回：
{"status":"completed","transcript":"Um I think I I would like to talk about...","rawTranscript":"Um I think I I would like to talk about...","language":"en","confidence":"medium","warning":"","qualityFlags":[]}

失败时严格返回：
{"status":"failed","transcript":"","error":"录音太短或音频不清晰，无法生成可靠转写。","qualityFlags":["audio_unclear"]}`
}
