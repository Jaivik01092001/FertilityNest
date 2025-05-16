import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Import reducers
import authReducer from "./slices/authSlice";
import cycleReducer from "./slices/cycleSlice";
import medicationReducer from "./slices/medicationSlice";
import chatReducer from "./slices/chatSlice";
import partnerReducer from "./slices/partnerSlice";
import communityReducer from "./slices/communitySlice";
import uiReducer from "./slices/uiSlice";

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  cycle: cycleReducer,
  medication: medicationReducer,
  chat: chatReducer,
  partner: partnerReducer,
  community: communityReducer,
  ui: uiReducer,
});

// Configure persist
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Only persist auth state
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// ✅ Corrected store setup
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }), // ⛔ No .concat(thunk) needed
});

export const persistor = persistStore(store);
