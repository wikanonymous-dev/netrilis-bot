import { $axios } from './axios'

export type MessageType = 'merge-request' | 'pipeline'

export interface MergeRequestTemplateData {
  sha_commit: string,
  repository_url: string,
  source_branch: string,
  target_branch: string,
  author: string,
  description: string
}

export interface JobTemplateData {
  sha_commit: string,
  ref: string,
  build_stage: string,
  build_status: string,
  build_failed_reason: string,
  triggerer: string,
}

export function getMergeRequestTemplateText (data: MergeRequestTemplateData) {
  return `🟢 New Merge Request
  ${data.sha_commit}\n
  Author: *${data.author}*
  Source branch: *${data.source_branch}*
  Target branch: *${data.target_branch}*
  Repository: *${data.repository_url}*\n
  *Description*:
  ${data.description}`
}

export function getJobTemplateText (data: JobTemplateData) {
  return `🟢 Pipeline Status
  ${data.sha_commit}\n
  Ref: *${data.ref}*
  Stage: *${data.build_stage}*
  Status: *${data.build_status}*
  Failed reason: *${data.build_failed_reason ?? '-'}*
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
