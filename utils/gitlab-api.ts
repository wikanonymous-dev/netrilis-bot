import axios from 'axios'
import { THREAD_ID_MAP } from './telegram-bot'

const GITLAB_API_URL = process.env.GITLAB_API_URL || 'https://gitlab.com/api/v4'
const GITLAB_API_TOKEN = process.env.GITLAB_API_TOKEN || ''
const GITLAB_PROJECT_ID = process.env.GITLAB_PROJECT_ID || ''

const gitlabAxios = axios.create({
  baseURL: GITLAB_API_URL,
  headers: {
    'PRIVATE-TOKEN': GITLAB_API_TOKEN,
    'Content-Type': 'application/json',
  },
  timeout: 4000
})

function mapCiVariableToCollection (value: string) {
  const variables = value.split('\n').filter((item) => item !== '').map((item) => {
    const keyPairValue = item.split('=')

    return {
      key: keyPairValue[0] || '',
      value: keyPairValue[1] || ''
    }
  })

  return variables
}

/**
 * Get a CI/CD variable value for a project.
 */
export async function getCiVariable(key: string, projectId?: string) {
  const pid = encodeURIComponent(projectId ?? GITLAB_PROJECT_ID)
  const res = await gitlabAxios.get(`/projects/${pid}/variables/${key}`)

  const variables = mapCiVariableToCollection(res.data.value)

  return variables
}

/**
 * Update a CI/CD variable value for a project.
 */
export async function updateCiVariable(key: string, value: string, projectId?: string) {
  const pid = encodeURIComponent(projectId ?? GITLAB_PROJECT_ID)
  const res = await gitlabAxios.put(`/projects/${pid}/variables/${key}`, { value })
  return res.data as { key: string; value: string }
}

/**
 * Get the most recent pipeline on the latest tag.
 */
export async function getLatestTagPipeline(projectId?: string) {
  const pid = encodeURIComponent(projectId ?? GITLAB_PROJECT_ID)

  // Get the latest tag
  const tagsRes = await gitlabAxios.get(`/projects/${pid}/repository/tags`, {
    params: { per_page: 1, order_by: 'updated', sort: 'desc' },
  })
  const tags = tagsRes.data as Array<{ name: string }>
  if (!tags.length) {
    throw new Error('No tags found in the project')
  }
  const latestTag = tags[0].name

  // Get the most recent pipeline for that tag
  const pipelinesRes = await gitlabAxios.get(`/projects/${pid}/pipelines`, {
    params: { ref: latestTag, per_page: 1, order_by: 'id', sort: 'desc' },
  })
  const pipelines = pipelinesRes.data as Array<{ id: number; ref: string; status: string; web_url: string }>
  if (!pipelines.length) {
    throw new Error(`No pipelines found for tag ${latestTag}`)
  }

  return { tag: latestTag, pipeline: pipelines[0] }
}

/**
 * Get most recent pipeline on the develop branch.
 */
export async function getLatestDevelopPipeline(projectId?: string) {
  const pid = encodeURIComponent(projectId ?? GITLAB_PROJECT_ID)

  // Get the most recent pipeline for the develop branch
  const pipelinesRes = await gitlabAxios.get(`/projects/${pid}/pipelines`, {
    params: { ref: 'develop', per_page: 1, order_by: 'id', sort: 'desc' },
  })
  const pipelines = pipelinesRes.data as Array<{ id: number; ref: string; status: string; web_url: string }>
  if (!pipelines.length) {
    throw new Error('No pipelines found for the develop branch')
  }

  return { tag: 'develop', pipeline: pipelines[0] }
}


/**
 * Get list jobs by pipeline id.
 */
export async function getPipelineJobs(pipelineId: number, projectId?: string) {
  const pid = encodeURIComponent(projectId ?? GITLAB_PROJECT_ID)
  const res = await gitlabAxios.get(`/projects/${pid}/pipelines/${pipelineId}/jobs`, {
    params: { per_page: 100 },
  })
  return res.data as Array<{ id: number; name: string; status: string; web_url: string }>
}

/**
 * Retry (re-run) a pipeline.
 */
export async function retryPipeline(pipelineId: number, projectId?: string) {
  const pid = encodeURIComponent(projectId ?? GITLAB_PROJECT_ID)
  const res = await gitlabAxios.post(`/projects/${pid}/pipelines/${pipelineId}/retry`)
  return res.data as { id: number; status: string; web_url: string }
}

/**
 * Run a job.
 */
export async function runJob(jobId: number, projectId?: string) {
  const threadId = THREAD_ID_MAP['ops']

  const pid = encodeURIComponent(projectId ?? GITLAB_PROJECT_ID)
  const res = await gitlabAxios.post(`/projects/${pid}/jobs/${jobId}/play`, { job_variables_attributes: [ { key: 'TELEGRAM_THREAD_ID', value: threadId?.toString() } ] })
  return res.data as { id: number; status: string; web_url: string }
}
