export interface StatsSummaryModel {
  totalReviewed: number;
  totalReviewedToday: number;
  totalReviewedThisWeek: number;
  totalReviewedThisMonth: number;
  approvedPercentage: number;
  rejectedPercentage: number;
  requestChangesPercentage: number;
  averageReviewTime: number;
}

export const defaultStatsSummary = {
  totalReviewed: 0,
  totalReviewedToday: 0,
  totalReviewedThisWeek: 0,
  totalReviewedThisMonth: 0,
  approvedPercentage: 0,
  rejectedPercentage: 0,
  requestChangesPercentage: 0,
  averageReviewTime: 0,
} as StatsSummaryModel;

export interface ActivityDataModel {
  date: string;
  approved: number;
  rejected: number;
  requestChanges: number;
}
export const defaultActivityData = {
  date: '',
  approved: 0,
  rejected: 0,
  requestChanges: 0,
} as ActivityDataModel;

export interface DecisionsDataModel {
  approved: number;
  rejected: number;
  requestChanges: number;
}
export const defaultDecisionsData = {
  approved: 0,
  rejected: 0,
  requestChanges: 0,
} as DecisionsDataModel;


export interface CategoriesDataModel {
  "Услуги": number;
  "Работа": number;
  "Электроника": number;
  "Животные": number;
  "Детское": number;
}

export const defaultCategoriesData = {
  "Услуги": 0,
  "Работа":0,
  "Электроника":0,
  "Животные":0,
  "Детское":0,
} as CategoriesDataModel;
