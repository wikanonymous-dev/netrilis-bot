import express, { Express, Request, Response } from 'express'
import 'dotenv/config'
import { getMergeRequestTemplateText, getJobTemplateText, sendMessage } from '../utils/telegram-bot'
import { handleCommand } from './commands'
import { TelegramUpdate } from './types'
import { removeArtifact } from '../utils/vercel-blob'

const app: Express = express()
const port = process.env.PORT || 3000

app.use(express.json())

// GitLab webhook — sends notifications to the CICD topic
app.post('/webhook/gitlab', async (req: Request, res: Response) => {
  try {
    const event = req.header('X-Gitlab-Event')
    const body = req.body

    let messageText = ''

    switch (event) {
      case 'Merge Request Hook':
        const mergeAction = body.object_attributes.action

        if (mergeAction === 'merge') {
          messageText = getMergeRequestTemplateText({
            url: String(body.object_attributes.url),
            source_branch: String(body.object_attributes.source_branch),
            target_branch: String(body.object_attributes.target_branch),
            author: String(body.user.username),
            description: String(body.object_attributes.description)
          })
        }
        break;

      case 'Pipeline Hook':
        const isFailed = body.object_attributes.status === 'failed'
        const isSuccess = body.object_attributes.status === 'success'
        const isBuildSuccess = body.builds.at(0).status === 'success'
        const isDeploySuccess = body.builds.at(-1).status === 'success'

        if (isFailed) {
          messageText = getJobTemplateText( '🚀 Deploy Failed', {
            ref: String(body.object_attributes.ref),
            url: String(body.object_attributes.url),
            triggerer: String(body.user.username)
          })
        } else if (isSuccess && isBuildSuccess && isDeploySuccess) {
          messageText = getJobTemplateText( '🚀 Deploy Success', {
            ref: String(body.object_attributes.ref),
            url: String(body.object_attributes.url),
            triggerer: String(body.user.username)
          })
        }
        break;

      case 'Job Hook':
        if (body.object_kind === 'build') {
          const jobId = body.build_id
          const tag = body.ref
          const jobName = body.build_name
          const status = body.build_status

          const artifactPath = `artifact/job-${jobId}-attributes.json`
          removeArtifact(artifactPath)
            .then(async () => {
              const topicMessage = `🚀 *Job re-triggered*\n\nTag: \`${tag}\`\nJob: \`${jobName}\`\nStatus: \`${status}\``

              console.info('✅ Job artifact file removed at:', artifactPath);

              await sendMessage(topicMessage, 'ops')
            })
            .catch((error) => {
              if (error.code === 'ENOENT') {
                console.info('ℹ️ Job artifact file does not exist. No cleanup needed.');
              } else {
                console.error('❌ An unexpected error occurred:', error.message);
              }
            })
        }

        break;

      default:
        break;
    }

    if (messageText) {
      await sendMessage(messageText, 'cicd')
    }
  } catch (error) {
    console.error(error)
  } finally {
    res.status(200).send('OK')
  }
})

// Telegram webhook — handles bot commands, sends responses to the OPS topic
app.post('/webhook/telegram', async (req: Request, res: Response) => {
  const update: TelegramUpdate = req.body

  try {
    if (update.message) {
      await handleCommand(update.message)

    // Respond immediately — Telegram expects a fast 200 OK
    res.status(200).json({
      code: 200,
      message: 'Success'
    })
    }
  } catch (error) {
    console.error('Telegram webhook error:', error)

    // Respond immediately — Telegram expects a fast 200 OK
    res.status(200).json({
      code: 200,
      message: 'Failed webhook'
    })
  }
})

app.get('/ping', (req, res) => {
  res.status(200).json({
    message: 'Pong'
  })
})

app.get('/', (req, res) => {
  res.send('Netrilis Bot')
})

app.get('*', (req, res) => {
  res.status(404).end()
})

app.listen(port, () => {
  console.log(`[server]: Server is running on port http://localhost:${port}`)
})

