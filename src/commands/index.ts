import { TelegramMessage } from '../types'
import { sendMessage } from '../../utils/telegram-bot'
import { handleStart } from './start'
import { handleHelp } from './help'
import { handleStartUpdateRevenue, handleStopUpdateRevenue, handleConfirmDeploy, handleStartBannerRevenue } from './update-revenue'

/**
 * Route an incoming Telegram message to the appropriate command handler.
 */
export async function handleCommand(message: TelegramMessage) {
  const text = message.text?.trim() || ''

  // Extract command (strip @botname if present, e.g. /start@MyBot → /start)
  const command = text.split(/[\s@]/)[0].toLowerCase()

  switch (command) {
    case '/start':
      await handleStart(message)
      break;

    case '/help':
      await handleHelp(message)
      break;

    case '/start_update_revenue':
      await handleStartUpdateRevenue(message)
      break;

    case '/stop_update_revenue':
      await handleStopUpdateRevenue(message)
      break;

    case '/confirm_deploy':
      await handleConfirmDeploy(message)
      break;

    case '/start_banner_revenue':
      const parts = text?.split(/\s+/) || []
      const fulltextArgs = text?.substring(parts[0].length).trim() || ''

      await handleStartBannerRevenue(message, fulltextArgs)
      break;

    default:
      await sendMessage(
        `❓ Unknown command: \`${command}\`\n\nAvailable commands:\n/start — Verify authorization\n/start\\_update\\_revenue — Disable maintenance & deploy\n/stop\\_update\\_revenue — Enable maintenance\n/confirm\\_deploy — Re-run latest tag pipeline`,
        'ops'
      )
      break;
  }
}
