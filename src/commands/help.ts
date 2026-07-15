import { TelegramMessage } from '../types'
import { sendMessage } from '../../utils/telegram-bot'

/**
 * Handle /help command
 */
export async function handleHelp(message: TelegramMessage) {
  const userId = message.from?.id
  const username = message.from?.username ?? message.from?.first_name ?? 'Unknown'

  if (!userId) {
    await sendMessage('❌ Could not identify user.', 'ops')
    return
  }

await sendMessage(
    `❓ *Help*\n\nAvailable commands:\n/start\\_update\\_revenue — Enable maintenance & deploy for update revenue\n/stop\\_update\\_revenue — Disable maintenance & revert\n/start\\_banner\\_revenue — Enable maintenance & deploy for banner revenue information`,
    'ops'
)
}
