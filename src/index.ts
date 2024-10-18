import express, { Express, Request, Response } from 'express'
import 'dotenv/config'
import { getMergeRequestTemplateText, getJobTemplateText, sendMessage } from 'utils/telegram-bot'

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

      if (!['open'].includes(mergeAction))
        return

        messageText = getMergeRequestTemplateText({
          sha_commit: String(body.object_attributes.merge_commit_sha),
          repository_url: String(body.project.web_url),
          source_branch: String(body.object_attributes.source_branch),
          target_branch: String(body.object_attributes.target_branch),
          author: String(body.user.username),
          description: String(body.object_attributes.description)
        })

      try {
      await sendMessage(messageText)
      } catch(error) {
        console.error(error)
      }
      break;

    case 'Job Hook':
      if (!['running', 'success', 'failed'].includes(body.build_status))
        return

      let buildStatus = ''

      switch (body.build_status) {
        case 'running':
          buildStatus = 'Running 🔄'
          break;

        case 'success':
          buildStatus = 'Success ✅'
          break;

        case 'failed':
          buildStatus = 'Failed ❌'
          break;

        default:
          buildStatus = 'Running 🔄'
          break;
      }

      messageText = getJobTemplateText({
        sha_commit: String(body.sha),
        ref: String(body.ref),
        build_stage: String(body.build_stage),
        build_name: String(body.build_name),
        build_status: buildStatus,
        build_failed_reason: body.status === 'failed' ? body.build_failure_reason : '',
        triggerer: String(body.user.username)
      })

      await sendMessage(messageText)
      break;

    default:
      break;
  }

  res.status(200).send('OK')
})

app.get('/ping', (req, res) => {
  res.status(200).json({
    message: 'Pong'
  })
})

app.get('*', (req, res) => {
  res.status(404).end()
})

app.listen(port, () => {
  console.log(`[server]: Server is running on port http://localhost:${port}`)
})
