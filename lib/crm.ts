/* Shared vocabulary for the Member Progress Dashboard (team-facing CRM).
   Values are stored as the `value` strings; labels are what the team sees. */

export const MEMBERSHIP_STATUS = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'renewal_due', label: 'Renewal due' },
  { value: 'renewed', label: 'Renewed' },
  { value: 'left', label: 'Left' },
] as const

export const MEMBER_TYPES = [
  { value: 'saas_builder', label: 'SaaS / product builder' },
  { value: 'business_owner_ai', label: 'Existing business owner using AI' },
  { value: 'aspiring', label: 'Aspiring founder' },
  { value: 'exploring', label: 'Exploring AI' },
  { value: 'other', label: 'Other' },
] as const

export const STAGES = [
  { value: 'decide', label: 'Decide', hint: 'Exploring, selecting or validating an idea; no clear build target yet.' },
  { value: 'build', label: 'Build', hint: 'Idea chosen, but no usable end-to-end product yet.' },
  { value: 'launch', label: 'Launch', hint: 'A working product exists but is not fully available to users yet.' },
  { value: 'sell', label: 'Sell', hint: 'Live, but no or few paying customers yet.' },
  { value: 'grow', label: 'Grow with AI', hint: 'Already runs a business; using AI to improve revenue, operations or delivery.' },
] as const

export const OUTCOMES = [
  { value: 'clarity', label: 'Get clarity on idea' },
  { value: 'mvp', label: 'Build usable MVP' },
  { value: 'launch', label: 'Launch' },
  { value: 'first_users', label: 'Get first users' },
  { value: 'first_paying', label: 'Get first paying customer' },
  { value: 'improve_sales', label: 'Improve sales' },
  { value: 'automate', label: 'Automate business process' },
  { value: 'learn', label: 'Learn or explore' },
  { value: 'other', label: 'Other' },
] as const

export const BLOCKERS = [
  { value: 'idea_clarity', label: 'Idea clarity' },
  { value: 'technical', label: 'Technical build' },
  { value: 'scope', label: 'Product scope' },
  { value: 'deploy_payments', label: 'Deployment or payments' },
  { value: 'finding_users', label: 'Finding users' },
  { value: 'marketing_sales', label: 'Marketing and sales' },
  { value: 'time', label: 'Time' },
  { value: 'confidence', label: 'Confidence or overwhelm' },
  { value: 'other', label: 'Other' },
] as const

export const TIME_AVAILABLE = [
  { value: 'lt1', label: 'Under 1 hour/week' },
  { value: '1-2', label: '1–2 hours/week' },
  { value: '3-5', label: '3–5 hours/week' },
  { value: '6+', label: '6+ hours/week' },
  { value: 'varies', label: 'Varies' },
] as const

export const SUPPORT_TYPES = [
  { value: 'workshop', label: 'Workshop' },
  { value: 'one_to_one', label: '1:1 guidance' },
  { value: 'peer_feedback', label: 'Peer feedback' },
  { value: 'technical', label: 'Technical help' },
  { value: 'accountability', label: 'Accountability' },
  { value: 'customers', label: 'Customer acquisition help' },
  { value: 'async', label: 'Async resources' },
] as const

export const PARTICIPATION = [
  { value: 'live', label: 'Live sessions' },
  { value: 'async', label: 'WhatsApp async' },
  { value: 'both', label: 'Both' },
  { value: 'occasional', label: 'Occasional only' },
] as const

export const GOAL_STATUS = [
  { value: 'active', label: 'Active' },
  { value: 'achieved', label: 'Achieved' },
  { value: 'partly', label: 'Partly achieved' },
  { value: 'not_achieved', label: 'Not achieved' },
  { value: 'changed', label: 'Changed by agreement' },
  { value: 'paused', label: 'Paused' },
] as const

export const CHECKIN_STATUS = [
  { value: 'on_track', label: 'On track' },
  { value: 'at_risk', label: 'At risk' },
  { value: 'paused', label: 'Paused' },
  { value: 'needs_support', label: 'Needs support' },
] as const

export const RENEWAL_SIGNAL = [
  { value: 'not_discussed', label: 'Not discussed' },
  { value: 'interested', label: 'Interested' },
  { value: 'unsure', label: 'Unsure' },
  { value: 'not_renewing', label: 'Not renewing' },
] as const

export const label = (list: readonly { value: string; label: string }[], v?: string | null) =>
  list.find(x => x.value === v)?.label ?? (v ? v : '')

export type CrmProfile = {
  email: string
  preferred_name: string | null
  membership_status: string
  member_type: string | null
  project_name: string | null
  building: string | null
  target_user: string | null
  stage: string | null
  stage_evidence: string | null
  main_outcome: string | null
  blocker: string | null
  time_available: string | null
  preferred_support: string[]
  preferred_participation: string | null
  skills: string | null
  can_offer: string | null
  call_notes: string | null
  last_contacted: string | null
  next_follow_up: string | null
  renewal_signal: string | null
  showcase_permission: boolean
  demo_url: string | null
  updated_at: string | null
  updated_by: string | null
}

export type Goal = {
  id: number
  email: string
  goal: string
  next_action: string | null
  set_on: string
  due_on: string | null
  status: string
  result: string | null
  proof: string | null
  learning: string | null
  reviewed_on: string | null
  created_by: string | null
  created_at: string
}

export type Checkin = {
  id: number
  email: string
  week_of: string
  progress: string | null
  evidence: string | null
  blocker: string | null
  help_requested: string | null
  next_action: string | null
  status: string
  followup_owner: string | null
  followup_due: string | null
  followup_done: boolean
  created_by: string | null
  created_at: string
}

export type HistoryRow = { id: number; email: string; field: string; old_value: string | null; new_value: string | null; reason: string | null; changed_by: string | null; changed_at: string }

export type Member = {
  member_no: number
  cohort: number
  full_name: string
  email: string
  whatsapp: string | null
  plan: string | null
  joined_at: string
  // What the member wrote in their own portal profile, shown as hints on the call.
  self: { what_building: string | null; who_its_for: string | null; problem: string | null; stage: string | null; need_help_with: string | null; link: string | null } | null
  crm: CrmProfile | null
  goals: Goal[]
  checkins: Checkin[]
  history: HistoryRow[]
}

/* The fields the team edits on the profile form, in the order they appear on the call. */
export const PROFILE_FIELDS = [
  'preferred_name', 'membership_status', 'member_type', 'project_name', 'building', 'target_user',
  'stage', 'stage_evidence', 'main_outcome', 'blocker', 'time_available', 'preferred_support',
  'preferred_participation', 'skills', 'can_offer', 'call_notes', 'last_contacted', 'next_follow_up',
  'renewal_signal', 'showcase_permission', 'demo_url',
] as const
export type ProfileField = (typeof PROFILE_FIELDS)[number]
