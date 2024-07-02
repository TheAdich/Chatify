// store.js

import { configureStore,combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {userReducer} from './userslice';

// Custom serialization transformation to handle user state
const userTransform = createTransform(
  (inboundState, key) => {
    // Modify the inbound state to only include necessary fields
    return {
      name: inboundState.name,
      email: inboundState.email,
      id: inboundState.id,
      token: inboundState.token
    };
  },
  (outboundState, key) => {
    // Return outbound state as is
    return outboundState;
  },
  { whitelist: ['user'] } // Only apply transformation to 'user' slice
);

const persistConfig = {
    key: 'root',
    storage,
    transforms: [userTransform]
  };

  const rootReducer = combineReducers({
    user: persistReducer(persistConfig, userReducer),

    // Add other reducers here if needed
  });
  const store= configureStore({
    reducer: rootReducer,
});
export const persistor = persistStore(store);
export default store;
