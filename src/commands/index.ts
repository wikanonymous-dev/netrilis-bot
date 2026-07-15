import { TelegramMessage } from '../types'
import { sendMessage } from '../../utils/telegram-bot'
import { handleStart } from './start'
import { handleHelp } from './help'
import { handleStartUpdateRevenue, handleStopUpdateRevenue, handleConfirmDeploy, handleStartBannerRevenue } from './update-revenue'

/**
 * Route an incoming Telegram message to the appropriate command handler.
 * Returns true if a command was handled, false otherwise.
 */
export async function handleCommand(message: TelegramMessage): Promise<boolean> {
  const text = message.text?.trim() || ''

  // Extract command (strip @botname if present, e.g. /start@MyBot → /start)
  const command = text.split(/[\s@]/)[0].toLowerCase()

  switch (command) {
    case '/start':
      await handleStart(message)
      return true

    case '/help':
      await handleHelp(message)
      return true

    case '/start_update_revenue':
      await handleStartUpdateRevenue(message)
      return true

    case '/stop_update_revenue':
      await handleStopUpdateRevenue(message)
      return true

    case '/confirm_deploy':
      await handleConfirmDeploy(message)
      return true

    case '/start_banner_revenue':
      const parts = text?.split(/\s+/) || []
      const fulltextArgs = text?.substring(parts[0].length).trim() || ''

      await handleStartBannerRevenue(message, fulltextArgs)
      return true

    default:
      await sendMessage(
        `❓ Unknown command: \`${command}\`\n\nAvailable commands:\n/start — Verify authorization\n/start\\_update\\_revenue — Disable maintenance & deploy\n/stop\\_update\\_revenue — Enable maintenance\n/confirm\\_deploy — Re-run latest tag pipeline`,
        'ops'
      )
      return true
  }
}
