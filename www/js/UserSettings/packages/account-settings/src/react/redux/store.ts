import { Action, ThunkAction, configureStore } from "@reduxjs/toolkit";
import baseApi from "../apis/common/baseApi";
import { parentalConsentSlice } from "../apis/slices/parentalConsentSlice";
import { childPagesSlice } from "../apis/slices/childPagesSlice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [parentalConsentSlice.name]: parentalConsentSlice.reducer,
    [childPagesSlice.name]: childPagesSlice.reducer,
  },
  middleware: middlewareFn => middlewareFn().concat(baseApi.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
