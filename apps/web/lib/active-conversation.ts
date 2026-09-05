// Tracks which conversation thread is currently mounted/open in this tab, so
// the navbar badge can skip bumping for messages the user is already reading
// (ConversationThread marks those as read itself) instead of racing it.
let activeConversationId: string | null = null;

export function setActiveConversationId(id: string | null) {
  activeConversationId = id;
}

export function getActiveConversationId() {
  return activeConversationId;
}
