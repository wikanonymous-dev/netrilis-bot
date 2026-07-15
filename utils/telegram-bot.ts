import { $axios } from './axios'

export type MessageType = 'merge-request' | 'pipeline'

export type TopicId = 'cicd' | 'ops'

const THREAD_ID_MAP: Record<TopicId, string | undefined> = {
  cicd: process.env.TELEGRAM_THREAD_ID_CICD,
  ops: process.env.TELEGRAM_THREAD_ID_OPS,
}

export interface MergeRequestTemplateData {
  url: string,
  source_branch: string,
  target_branch: string,
  author: string,
  description: string
}

export interface JobTemplateData {
  ref: string,
  url: string,
  triggerer: string,
}

export function getMergeRequestTemplateText (data: MergeRequestTemplateData) {
  return `🟢 New Merge Request\n
  Author: *${data.author}*
  Source branch: *${data.source_branch}*
  Target branch: *${data.target_branch}*
  URL: *${data.url}*
  Status: *Merged*\n
  *Description*:
  ${data.description}`
}

export function getJobTemplateText (title: string, data: JobTemplateData) {
  return `${title}\n
  Ref: *${data.ref}*
  URL: *${data.url}*
  Trigger by: *${data.triggerer}*`
}

export function sendMessage(messageText: string, topic: TopicId = 'cicd', chatId?: string) {
  const threadId = THREAD_ID_MAP[topic]
  const payload = {
    chat_id: chatId ?? process.env.TELEGRAM_NETRILIS_CHAT_ID,
    message_thread_id: threadId ?? undefined,
    text: messageText,
    parse_mode: 'Markdown'
  }

  console.log('PAYLOAD', payload)
  return $axios.post('sendMessage', payload)
}
