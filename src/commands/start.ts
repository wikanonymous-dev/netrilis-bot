import { TelegramMessage } from '../types'
import { sendMessage } from '../../utils/telegram-bot'

const ALLOWED_USER_IDS: number[] = (process.env.TELEGRAM_ALLOWED_USER_IDS || '')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean)
  .map(Number)

/**
 * Check if a Telegram user ID is in the allowlist.
 */
export function isAuthorized(userId: number): boolean {
  return ALLOWED_USER_IDS.includes(userId)
}

/**
 * Handle /start command — verify user against allowlist.
 */
export async function handleStart(message: TelegramMessage) {
  const userId = message.from?.id
  const username = message.from?.username ?? message.from?.first_name ?? 'Unknown'

  if (!userId) {
    await sendMessage('❌ Could not identify user.', 'ops')
    return
  }

  if (isAuthorized(userId)) {
    await sendMessage(
      `✅ *Authorized*\n\nWelcome, @${username}! (ID: \`${userId}\`)\n\nAvailable commands:\n/start\\_update\\_revenue — Disable maintenance & deploy\n/stop\\_update\\_revenue — Enable maintenance & revert`,
      'ops'
    )
  } else {
    await sendMessage(
      `❌ *Unauthorized*\n\nUser @${username} (ID: \`${userId}\`) is not in the allowlist.`,
      'ops'
    )
  }
}
