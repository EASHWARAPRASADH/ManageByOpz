import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface EmployeesState {
  searchTerm: string;
  statusFilter: string;
  locationFilter: string;
  deptFilter: string;
  typeFilter: string;
  sortBy: string;
  currentPage: number;
}

const initialState: EmployeesState = {
  searchTerm: '',
  statusFilter: '',
  locationFilter: '',
  deptFilter: '',
  typeFilter: '',
  sortBy: 'name',
  currentPage: 1,
};

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.currentPage = 1;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
      state.currentPage = 1;
    },
    setLocationFilter: (state, action: PayloadAction<string>) => {
      state.locationFilter = action.payload;
      state.currentPage = 1;
    },
    setDeptFilter: (state, action: PayloadAction<string>) => {
      state.deptFilter = action.payload;
      state.currentPage = 1;
    },
    setTypeFilter: (state, action: PayloadAction<string>) => {
      state.typeFilter = action.payload;
      state.currentPage = 1;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    resetFilters: (state) => {
      state.searchTerm = '';
      state.statusFilter = '';
      state.locationFilter = '';
      state.deptFilter = '';
      state.typeFilter = '';
      state.sortBy = 'name';
      state.currentPage = 1;
    },
  },
});

export const {
  setSearchTerm,
  setStatusFilter,
  setLocationFilter,
  setDeptFilter,
  setTypeFilter,
  setSortBy,
  setCurrentPage,
  resetFilters,
} = employeesSlice.actions;

export default employeesSlice.reducer;
