export interface FiltersModel {
  statuses: string[];
  categoryId: string;
  minPrice: string;
  maxPrice: string;
}

export const defaultFilters = {
  statuses: [],
  categoryId: '',
  minPrice: '',
  maxPrice: '',
} as FiltersModel;
