import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { apiSlice } from "./api/apiSlice"
import authReducer from '../features/auth/slices/authSlice'
import  storage  from "redux-persist/lib/storage";
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
  } from 'redux-persist'


  const reducers = combineReducers({
    [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authReducer
  });
  
  const persistConfig = {
    key: 'root',
    version: 1,
    storage: storage,
  }

  const persistedReducer = persistReducer(persistConfig, reducers)
  
//   export const rootReducer= (state, action) => {
//     // if (action.type === RESET_STATE_ACTION_TYPE) {
//     //   state = {};
//     // }
  
//     return combinedReducer(state, action);
//   }

export const store = configureStore({
    reducer: persistedReducer
    ,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: {
              ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
            }
          }).concat(apiSlice.middleware),
    devTools: true
})

export const persistor = persistStore(store);
