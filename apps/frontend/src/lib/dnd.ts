export const ITEM_TYPES = {
  issue: "issue",
} as const;

export interface DraggedIssue {
  issueId: string;
  sectionId: string;
}

export interface MoveIssueAction {
  issueId: string;
  targetSectionId: string;
  newKey: string;
}