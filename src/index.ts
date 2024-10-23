import express, { Express, Request, Response } from 'express'
import 'dotenv/config'
import { getMergeRequestTemplateText, getJobTemplateText, sendMessage } from '../utils/telegram-bot'

const app: Express = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.post('/webhook/gitlab', async (req: Request, res: Response) => {
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
          ref: String(body.ref),
          url: String(body.object_attributes.url),
          triggerer: String(body.user.username)
        })
      } else if (isSuccess && isBuildSuccess && isDeploySuccess) {
        messageText = getJobTemplateText( '🚀 Deploy Success', {
          ref: String(body.ref),
          url: String(body.object_attributes.url),
          triggerer: String(body.user.username)
        })
      }
      break;

    default:
      break;
  }

  try {
    if (messageText) {
      await sendMessage(messageText)
    }
  } catch (error) {
    console.error(error)
  } finally {
    res.status(200).send('OK')
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
