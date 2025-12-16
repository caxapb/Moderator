import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AdModel } from '../models/AdsModels';
import type { FiltersModel } from '../models/FiltersModel';
import { defaultFilters } from '../models/FiltersModel';
import type { PaginationModel } from '../models/PaginationModel';
import { defaultPagination } from '../models/PaginationModel';

type SortOrder = '' | 'asc' | 'desc';
type SortBy = '' | 'createdAt' | 'price' | 'priority';

export interface AdsState {
  ads: AdModel[];
  filters: FiltersModel;
  sortBy: SortBy;
  sortOrder: SortOrder;
  pagination: PaginationModel;
  selectedIds: Set<number>;
  allAreChosen: boolean;
}

const initialState: AdsState = {
  ads: [],
  filters: defaultFilters,
  sortBy: '',
  sortOrder: '',
  pagination: defaultPagination,
  selectedIds: new Set(),
  allAreChosen: false,
};

const adsSlice = createSlice({
  name: 'ads',
  initialState,
  reducers: {
    setAds(state, action: PayloadAction<AdModel[]>) {
      state.ads = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<FiltersModel>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },
    setSortBy(state, action: PayloadAction<SortBy>) {
      state.sortBy = action.payload;
    },
    setSortOrder(state, action: PayloadAction<SortOrder>) {
      state.sortOrder = action.payload;
    },
    setPagination(state, action: PayloadAction<PaginationModel>) {
      state.pagination = action.payload;
    },
    setItemsPerPage(state, action: PayloadAction<number>) {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1;
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.pagination.currentPage = action.payload;
    },
    toggleSelected(state, action: PayloadAction<number>) {
      const id = action.payload;
      // TODO: переписать, стейт не должен меняться, должен обновляться
      if (state.selectedIds.has(id)) {
        state.selectedIds.delete(id);
      } else {
        state.selectedIds.add(id);
      }
    },
    selectAll(state) {
      if (state.allAreChosen) {
        state.selectedIds = new Set();
        state.allAreChosen = false;
      } else {
        state.selectedIds = new Set(state.ads.map((ad) => ad.id));
        state.allAreChosen = true;
      }
    },
    resetSelection(state) {
      state.selectedIds = new Set();
      state.allAreChosen = false;
    },
  },
});

export const {
  setAds,
  setFilters,
  setSortBy,
  setSortOrder,
  setPagination,
  setItemsPerPage,
  setCurrentPage,
  toggleSelected,
  selectAll,
  resetSelection,
} = adsSlice.actions;

export default adsSlice.reducer;
