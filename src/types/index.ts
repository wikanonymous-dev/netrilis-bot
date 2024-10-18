export interface GitlabMergeRequestPayload {
  object_kind: string
  event_type: string
  user: User
  project: Project
  repository: Repository
  object_attributes: ObjectAttributes
  labels: Label2[]
  changes: Changes
  assignees: Assignee[]
  reviewers: Reviewer[]
}

export interface User {
  id: number
  name: string
  username: string
  avatar_url: string
  email: string
}

export interface Project {
  id: number
  name: string
  description: string
  web_url: string
  avatar_url: any
  git_ssh_url: string
  git_http_url: string
  namespace: string
  visibility_level: number
  path_with_namespace: string
  default_branch: string
  ci_config_path: string
  homepage: string
  url: string
  ssh_url: string
  http_url: string
}

export interface Repository {
  name: string
  url: string
  description: string
  homepage: string
}

export interface ObjectAttributes {
  id: number
  iid: number
  target_branch: string
  source_branch: string
  source_project_id: number
  author_id: number
  assignee_ids: number[]
  assignee_id: number
  reviewer_ids: number[]
  title: string
  created_at: string
  updated_at: string
  last_edited_at: string
  last_edited_by_id: number
  milestone_id: any
  state_id: number
  state: string
  blocking_discussions_resolved: boolean
  work_in_progress: boolean
  draft: boolean
  first_contribution: boolean
  merge_status: string
  target_project_id: number
  description: string
  prepared_at: string
  total_time_spent: number
  time_change: number
  human_total_time_spent: string
  human_time_change: string
  human_time_estimate: string
  url: string
  source: Source
  target: Target
  last_commit: LastCommit
  labels: Label[]
  action: string
  detailed_merge_status: string
}

export interface Source {
  name: string
  description: string
  web_url: string
  avatar_url: any
  git_ssh_url: string
  git_http_url: string
  namespace: string
  visibility_level: number
  path_with_namespace: string
  default_branch: string
  homepage: string
  url: string
  ssh_url: string
  http_url: string
}

export interface Target {
  name: string
  description: string
  web_url: string
  avatar_url: any
  git_ssh_url: string
  git_http_url: string
  namespace: string
  visibility_level: number
  path_with_namespace: string
  default_branch: string
  homepage: string
  url: string
  ssh_url: string
  http_url: string
}

export interface LastCommit {
  id: string
  message: string
  title: string
  timestamp: string
  url: string
  author: Author
}

export interface Author {
  name: string
  email: string
}

export interface Label {
  id: number
  title: string
  color: string
  project_id: number
  created_at: string
  updated_at: string
  template: boolean
  description: string
  type: string
  group_id: number
}

export interface Label2 {
  id: number
  title: string
  color: string
  project_id: number
  created_at: string
  updated_at: string
  template: boolean
  description: string
  type: string
  group_id: number
}

export interface Changes {
  updated_by_id: UpdatedById
  draft: Draft
  updated_at: UpdatedAt
  labels: Labels
  last_edited_at: LastEditedAt
  last_edited_by_id: LastEditedById
}

export interface UpdatedById {
  previous: any
  current: number
}

export interface Draft {
  previous: boolean
  current: boolean
}

export interface UpdatedAt {
  previous: string
  current: string
}

export interface Labels {
  previous: Previou[]
  current: Current[]
}

export interface Previou {
  id: number
  title: string
  color: string
  project_id: number
  created_at: string
  updated_at: string
  template: boolean
  description: string
  type: string
  group_id: number
}

export interface Current {
  id: number
  title: string
  color: string
  project_id: number
  created_at: string
  updated_at: string
  template: boolean
  description: string
  type: string
  group_id: number
}

export interface LastEditedAt {
  previous: any
  current: string
}

export interface LastEditedById {
  previous: any
  current: number
}

export interface Assignee {
  id: number
  name: string
  username: string
  avatar_url: string
}

export interface Reviewer {
  id: number
  name: string
  username: string
  avatar_url: string
}
