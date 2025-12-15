export interface PaginationModel {
  currentPage: number;
  totalPages:  number;
  totalItems: number;
  itemsPerPage: number;
}

export const defaultPagination = {
  currentPage: 1,
  totalPages:  1,
  totalItems: 10,
  itemsPerPage: 10,
} as PaginationModel;