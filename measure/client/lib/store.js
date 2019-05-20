import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';

import notification from '../reducers/notification';
import dashboard from '../reducers/dashboard';
import app from '../reducers/app';

const rootReducer = combineReducers({
  notification,
  dashboard,
  app,
});

export default createStore(
  rootReducer,
  applyMiddleware(
    thunk,
    logger
  )
);
