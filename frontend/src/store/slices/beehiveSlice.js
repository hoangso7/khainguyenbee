import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../lib/api.js';

// Async thunks for API calls
export const fetchBeehives = createAsyncThunk(
  'beehives/fetchBeehives',
  async (params = {}) => {
    const response = await apiService.getBeehives(params.page || 1, params.perPage || 20, params);
    return response;
  }
);

export const fetchSoldBeehives = createAsyncThunk(
  'beehives/fetchSoldBeehives',
  async (params = {}) => {
    const response = await apiService.getSoldBeehives(params.page || 1, params.perPage || 20);
    return response;
  }
);

export const fetchBeehiveStats = createAsyncThunk(
  'beehives/fetchStats',
  async () => {
    const response = await apiService.getStats();
    return response;
  }
);

export const fetchBeehive = createAsyncThunk(
  'beehives/fetchBeehive',
  async (serialNumber) => {
    const response = await apiService.getBeehive(serialNumber);
    return response;
  }
);

export const createBeehive = createAsyncThunk(
  'beehives/createBeehive',
  async (beehiveData) => {
    const response = await apiService.createBeehive(beehiveData);
    return response;
  }
);

export const updateBeehive = createAsyncThunk(
  'beehives/updateBeehive',
  async ({ serialNumber, data }) => {
    const response = await apiService.updateBeehive(serialNumber, data);
    return response;
  }
);

export const deleteBeehive = createAsyncThunk(
  'beehives/deleteBeehive',
  async (serialNumber) => {
    await apiService.deleteBeehive(serialNumber);
    return serialNumber;
  }
);

export const sellBeehive = createAsyncThunk(
  'beehives/sellBeehive',
  async (serialNumber) => {
    const response = await apiService.sellBeehive(serialNumber);
    return response;
  }
);

export const unsellBeehive = createAsyncThunk(
  'beehives/unsellBeehive',
  async (serialNumber) => {
    const response = await apiService.unsellBeehive(serialNumber);
    return response;
  }
);

const beehiveSlice = createSlice({
  name: 'beehives',
  initialState: {
    activeBeehives: [],
    soldBeehives: [],
    currentBeehive: null,
    stats: {
      total: 0,
      active: 0,
      sold: 0,
      healthy: 0,
    },
    healthStats: {},
    loading: false,
    error: null,
    pagination: {
      page: 1,
      perPage: 20,
      total: 0,
      totalPages: 0,
    },
    filters: {
      importDate: '',
      splitDate: '',
      soldDate: '',
    },
    sort: {
      field: 'serial_number',
      order: 'desc',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSort: (state, action) => {
      state.sort = action.payload;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch beehives
      .addCase(fetchBeehives.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBeehives.fulfilled, (state, action) => {
        state.loading = false;
        state.activeBeehives = action.payload.beehives;
        state.pagination = action.payload.pagination;
        state.healthStats = action.payload.healthStats;
      })
      .addCase(fetchBeehives.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch sold beehives
      .addCase(fetchSoldBeehives.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSoldBeehives.fulfilled, (state, action) => {
        state.loading = false;
        state.soldBeehives = action.payload.beehives;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSoldBeehives.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch stats
      .addCase(fetchBeehiveStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Fetch single beehive
      .addCase(fetchBeehive.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBeehive.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBeehive = action.payload;
      })
      .addCase(fetchBeehive.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create beehive
      .addCase(createBeehive.fulfilled, (state, action) => {
        state.activeBeehives.unshift(action.payload);
        state.stats.total += 1;
        state.stats.active += 1;
      })
      // Update beehive
      .addCase(updateBeehive.fulfilled, (state, action) => {
        const index = state.activeBeehives.findIndex(
          b => b.serial_number === action.payload.serial_number
        );
        if (index !== -1) {
          state.activeBeehives[index] = action.payload;
        }
      })
      // Delete beehive
      .addCase(deleteBeehive.fulfilled, (state, action) => {
        state.activeBeehives = state.activeBeehives.filter(
          b => b.serial_number !== action.payload
        );
        state.stats.total -= 1;
        state.stats.active -= 1;
      })
      // Sell beehive
      .addCase(sellBeehive.fulfilled, (state, action) => {
        const beehive = state.activeBeehives.find(
          b => b.serial_number === action.payload.serial_number
        );
        if (beehive) {
          state.activeBeehives = state.activeBeehives.filter(
            b => b.serial_number !== action.payload.serial_number
          );
          state.soldBeehives.unshift(action.payload);
          state.stats.active -= 1;
          state.stats.sold += 1;
        }
      })
      // Unsell beehive
      .addCase(unsellBeehive.fulfilled, (state, action) => {
        const beehive = state.soldBeehives.find(
          b => b.serial_number === action.payload.serial_number
        );
        if (beehive) {
          state.soldBeehives = state.soldBeehives.filter(
            b => b.serial_number !== action.payload.serial_number
          );
          state.activeBeehives.unshift(action.payload);
          state.stats.active += 1;
          state.stats.sold -= 1;
        }
      });
  },
});

export const { setFilters, setSort, setPage, clearError } = beehiveSlice.actions;
export default beehiveSlice.reducer;
