
import {createSwitchNavigator, createAppContainer} from 'react-navigation';
import React from 'react';
import FlashMessage from 'react-native-flash-message';
import {AuthNavigationStack} from "./AuthNavigation";
import {MainStack} from "./MainNavigation";
import { AdminStack } from './AdminNavigation';


const Navigation = createSwitchNavigator(
  {
    Auth: {
      screen: AuthNavigationStack,
    },
    Main: {
      screen: MainStack,
    },
    Admin: {
      screen: AdminStack
    }
  },
  {
    initialRouteName: 'Auth',
  },
);

export const AppContainer = createAppContainer(Navigation);

export const App = () => {
  return (
    <React.Fragment>
      <AppContainer />
      <FlashMessage position="top" />
    </React.Fragment>
  );
};
