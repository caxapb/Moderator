export interface ModerationHistoryModel {
  id: number;
  moderatorId: number;
  moderatorName:string;
  action: ACTION;
  reason?: string;
  comment: string;
  timestamp: string;
}

export enum ACTION {
  approved = "approved", 
  rejected = "rejected", 
  requestChanges = "requestChanges",
};
