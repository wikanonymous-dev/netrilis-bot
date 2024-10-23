import { $axios } from './axios'

export type MessageType = 'merge-request' | 'pipeline'

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
  return `🟢 New Merge Request
  Author: *${data.author}*
  Source branch: *${data.source_branch}*
  Target branch: *${data.target_branch}*
  URL: *${data.url}*
  Status: *Merged*\n
  *Description*:
  ${data.description}`
}

export function getJobTemplateText (title: string, data: JobTemplateData) {
  return `${title}
  Ref: *${data.ref}*
  URL: *${data.url}*
  Trigger by: *${data.triggerer}*`
}

export function sendMessage(messageText: string, chatId?: string) {
  return $axios.post('sendMessage', {
    chat_id: chatId ?? process.env.TELEGRAM_NETRILIS_CHAT_ID,
    message_thread_id: process.env.TELEGRAM_NETRILIS_MESSAGE_THREAD_ID ?? undefined,
    text: messageText,
    parse_mode: 'Markdown'
  })
}
