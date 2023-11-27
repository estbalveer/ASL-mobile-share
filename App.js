import React, { useState, useEffect } from 'react';
import { Alert, AppState, Image, LogBox, PermissionsAndroid, Platform, Text, View, } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import axios from 'axios';
import { createStore, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import rootReducer from './src/redux/reducers';
import thunkMiddleware from 'redux-thunk';
import { Root } from 'native-base';
import Navigation from './src/navigations';
import { BASE_API_URL } from './src/utils/config'
import LiveTracking from './src/components/LiveTracking';
import PermissionAlert from './src/components/PermissionAlert';

axios.defaults.baseURL = BASE_API_URL;

const store = createStore(rootReducer,
  applyMiddleware(
    thunkMiddleware,
  ),
);

LogBox.ignoreAllLogs();

const App = () => {
  
  return (
    <Provider store={store}>
      <Root>
        <Navigation />
        <LiveTracking />
        <PermissionAlert />
      </Root>
    </Provider>
  );
};
export default App;
