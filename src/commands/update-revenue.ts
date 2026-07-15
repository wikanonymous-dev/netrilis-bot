import { TelegramMessage } from '../types'
import { sendMessage } from '../../utils/telegram-bot'
import { isAuthorized } from './start'
import {
  updateCiVariable,
  getCiVariable,
  getLatestTagPipeline,
  getLatestDevelopPipeline,
  getPipelineJobs,
  retryPipeline,
  runJob,
} from '../../utils/gitlab-api'

const MAINTENANCE_VAR_KEY = process.env.GITLAB_MAINTENANCE_VAR_KEY || 'MAINTENANCE_MODE'

/**
 * Handle /start_update_revenue
 * 1. Verify authorization
 * 2. Update CI/CD variable to disable maintenance
 * 3. Find latest tag pipeline
 * 4. Send confirmation with pipeline details
 */
export async function handleStartUpdateRevenue(message: TelegramMessage) {
  const userId = message.from?.id
  const username = message.from?.username ?? message.from?.first_name ?? 'Unknown'

  if (!userId || !isAuthorized(userId)) {
    await sendMessage('❌ *Unauthorized* — You are not allowed to perform this action.', 'ops')
    return
  }

  try {
    // 1. Get current maintenance state
    const currentVar = await getCiVariable(MAINTENANCE_VAR_KEY)
    // Get IS_UNDER_MAINTENANCE variable
    const isUnderMaintenanceIndex = currentVar.findIndex((item) => item.key === 'IS_UNDER_MAINTENANCE')
    if (isUnderMaintenanceIndex < 0) {
      await sendMessage('❌ *Error*: \`IS_UNDER_MAINTENANCE\` variable not found.', 'ops')
      return
    }

    await sendMessage(`ℹ️ Current \`${currentVar[isUnderMaintenanceIndex].key}\`: \`${currentVar[isUnderMaintenanceIndex].value}\``, 'ops')

    // 2. Enable maintenance mode for update revenue
    const newVar = [...currentVar]
    newVar[isUnderMaintenanceIndex].value = 'true'

    const newVarStringValue = newVar.map((item) => `${item.key}=${item.value}`).join('\n')
    await updateCiVariable(MAINTENANCE_VAR_KEY, newVarStringValue)
    await sendMessage(`✅ \`${currentVar[isUnderMaintenanceIndex].key}\` updated to \`true\``, 'ops')

    if (MAINTENANCE_VAR_KEY === 'PRODUCTION_CONFIG_FE') {
      // 3. Find latest tag pipeline
      const { tag, pipeline } = await getLatestTagPipeline()
      await sendMessage(
        `🚀 *Ready to deploy*\n\nTag: \`${tag}\`\nPipeline: [#${pipeline.id}](${pipeline.web_url})\nStatus: \`${pipeline.status}\`\n\nTriggered by: @${username}\n\nSend /confirm\\_deploy to re-run the pipeline.`,
        'ops'
      )
    } else {
      await sendMessage(
        `🚀 *Ready to deploy*\n\nSend /confirm\\_deploy to re-run the pipeline.`,
        'ops'
      )
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    await sendMessage(`❌ *Error*: ${errMsg}`, 'ops')
  }
}

/**
 * Handle /confirm_deploy
 * Re-run the latest tag pipeline.
 */
export async function handleConfirmDeploy(message: TelegramMessage) {
  const userId = message.from?.id

  if (!userId || !isAuthorized(userId)) {
    await sendMessage('❌ *Unauthorized* — You are not allowed to perform this action.', 'ops')
    return
  }

  try {
    let tag = ''
    let pipeline = {
      id: 0,
      status: '',
      web_url: '',
    }

    if (MAINTENANCE_VAR_KEY === 'PRODUCTION_CONFIG_FE') {
      const resultPipeline = await getLatestTagPipeline()

      tag = resultPipeline.tag
      pipeline = resultPipeline.pipeline
    } else {
      const resultPipeline = await getLatestDevelopPipeline()

      tag = resultPipeline.tag
      pipeline = resultPipeline.pipeline
    }

    const jobs = await getPipelineJobs(pipeline.id)

    if (jobs.length === 0) {
      await sendMessage(`❌ *Error*: No jobs found for pipeline [#${pipeline.id}](${pipeline.web_url}).`, 'ops')
      return
    }

    // just re-run the deployment job
    const jobName = MAINTENANCE_VAR_KEY === 'PRODUCTION_CONFIG_FE' ? 'deploy-release-stable' : 'deploy-release-develop'
    const deploymentJob = jobs.find((item) => item.name === jobName)

    if (!deploymentJob) {
      await sendMessage(`❌ *Error*: No deployment job found for pipeline [#${pipeline.id}](${pipeline.web_url}).`, 'ops')
      return
    }

    if (deploymentJob.status === 'failed') {
      const result = await retryPipeline(pipeline.id)
      await sendMessage(
        `🚀 *Pipeline re-triggered*\n\nTag: \`${tag}\`\nPipeline: [#${result.id}](${result.web_url})\nStatus: \`${result.status}\``,
        'ops'
      )
    } else {
      const result = await runJob(deploymentJob.id)
      await sendMessage(
        `🚀 *Job re-triggered*\n\nTag: \`${tag}\`\nJob: \`${deploymentJob.name}\`\nStatus: \`${result.status}\``,
        'ops'
      )
    }
    
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    await sendMessage(`❌ *Error*: ${errMsg}`, 'ops')
  }
}

/**
 * Handle /stop_update_revenue
 * 1. Verify authorization
 * 2. Update CI/CD variable to enable maintenance
 * 3. Confirm
 */
export async function handleStopUpdateRevenue(message: TelegramMessage) {
  const userId = message.from?.id

  if (!userId || !isAuthorized(userId)) {
    await sendMessage('❌ *Unauthorized* — You are not allowed to perform this action.', 'ops')
    return
  }

  try {
    // 1. Get current maintenance state
    const currentVar = await getCiVariable(MAINTENANCE_VAR_KEY)
    // Get IS_UNDER_MAINTENANCE variable
    const isUnderMaintenanceIndex = currentVar.findIndex((item) => item.key === 'IS_UNDER_MAINTENANCE')
    if (isUnderMaintenanceIndex < 0) {
      await sendMessage('❌ *Error*: \`IS_UNDER_MAINTENANCE\` variable not found.', 'ops')
      return
    }

    await sendMessage(`ℹ️ Current \`${currentVar[isUnderMaintenanceIndex].key}\`: \`${currentVar[isUnderMaintenanceIndex].value}\``, 'ops')

    // 2. Disable maintenance mode
    const newVar = [...currentVar]
    newVar[isUnderMaintenanceIndex].value = 'false'

    // 3.
    // Get NETRILIS_CONTEXTUAL_BANNER_SLUG variable
    const contextualBannerSlugIndex = currentVar.findIndex((item) => item.key === 'NETRILIS_CONTEXTUAL_BANNER_SLUG')
    if (contextualBannerSlugIndex < 0) {
      await sendMessage('❌ *Error*: \`NETRILIS_CONTEXTUAL_BANNER_SLUG\` variable not found.', 'ops')
      return
    }

    // 4. Set contextual banner slug to 'tax-early-info'
    newVar[contextualBannerSlugIndex].value = 'tax-early-info'

    const newVarStringValue = newVar.map((item) => `${item.key}=${item.value}`).join('\n')
    await updateCiVariable(MAINTENANCE_VAR_KEY, newVarStringValue)
    await sendMessage(`✅ \`${currentVar[isUnderMaintenanceIndex].key}\` updated to \`false\``, 'ops')
    await sendMessage(`✅ \`${currentVar[contextualBannerSlugIndex].key}\` updated to \`tax-early-info\``, 'ops')

    await sendMessage(
      `🚀 *Ready to deploy*\n\nSend /confirm\\_deploy to re-run the pipeline.`,
      'ops'
    )

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    await sendMessage(`❌ *Error*: ${errMsg}`, 'ops')
  }
}

/**
 * Handle /start_banner_revenue
 * 1. Verify authorization
 * 2. Update CI/CD variable NETRILIS_CONTEXTUAL_BANNER_SLUG to 'revenue_update' and NETRILIS_CONTEXTUAL_BANNER_REVENUE_TIME from message argument
 * 3. Confirm
 */
export async function handleStartBannerRevenue(message: TelegramMessage, revenueTime: string) {
  const userId = message.from?.id

  if (!userId || !isAuthorized(userId)) {
    await sendMessage('❌ *Unauthorized* — You are not allowed to perform this action.', 'ops')
    return
  }

    // 1. Get current variable
    const currentVar = await getCiVariable(MAINTENANCE_VAR_KEY)

    const bannerSlugIndex = currentVar.findIndex((item) => item.key === 'NETRILIS_CONTEXTUAL_BANNER_SLUG')
    const bannerRevenueTimeIndex = currentVar.findIndex((item) => item.key === 'NETRILIS_CONTEXTUAL_BANNER_REVENUE_TIME')

    if (bannerSlugIndex < 0) {
      await sendMessage('❌ *Error*: \`NETRILIS_CONTEXTUAL_BANNER_SLUG\` variable not found.', 'ops')
      return
    }

    if (bannerRevenueTimeIndex < 0) {
      await sendMessage('❌ *Error*: \`NETRILIS_CONTEXTUAL_BANNER_REVENUE_TIME\` variable not found.', 'ops')
      return
    }

    // 2. Update variable
    const newVar = [...currentVar]
    newVar[bannerSlugIndex].value = 'revenue-update'
    newVar[bannerRevenueTimeIndex].value = revenueTime

    const newVarStringValue = newVar.map((item) => `${item.key}=${item.value}`).join('\n')
    await updateCiVariable(MAINTENANCE_VAR_KEY, newVarStringValue)

    await sendMessage(
      `🚀 *Ready to deploy*\n\nSend /confirm\\_deploy to re-run the pipeline.`,
      'ops'
    )
}
