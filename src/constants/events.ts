export const OPEN_AI_CHAT_WIDGET_EVENT = 'ai-chat:open-widget'

// Lets a flow that owns the navigation itself (the payment redirect) skip the
// create-post draft guard.
export const CREATE_POST_BYPASS_DRAFT_GUARD_EVENT =
  'create-post:bypass-draft-guard'

// Tells the draft guard that what is on screen has just been persisted, so it
// should treat the current form state as the new saved baseline.
export const CREATE_POST_DRAFT_SAVED_EVENT = 'create-post:draft-saved'
