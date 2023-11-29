import React from 'react';
// import styles from './styles';
import Home from '../screens/HomeScreenV2';
import ScheduleScreen from '../screens/ScheduleScreen'
import AbsentScreen from '../screens/AbsentScreen';
import AbsentScreenEnhancement from '../screens/AbsentScreenEnhancement';
import CheckinScreen from '../screens/CheckinScreen'
import CheckoutScreen from '../screens/CheckoutScreen'
import ClientDBScreen from '../screens/ClientDBScreen'
import CreateClientScreen from '../screens/CreateClientScreen'
import ResourceScreen from '../screens/ResourceScreen'

import { createSwitchNavigator } from "react-navigation";
import DirectCheckinScreen from '../screens/DirectCheckinScreen';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import FeatherIcon from 'react-native-vector-icons/Feather'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AbsentDetailScreen from '../screens/AbsentDetailScreen';

export const TempStack = createMaterialBottomTabNavigator(
  {
    AbsentAdmin: {
      screen: AbsentScreen,
      navigationOptions: {
        tabBarLabel: 'Absent',
        tabBarIcon: ({ tintColor }) => (
          <FeatherIcon name="user-check" size={18} color={tintColor} />
        )
      }
    },
  },
  {
    initialRouteName: 'AbsentAdmin',
    barStyle: {
      backgroundColor: '#3876BF'
    }
  },
);


export const HomeStack = createSwitchNavigator(
  {
    Home: {
      screen: Home,
      navigationOptions: {
        header: null,
      },
    },
    Schedule: {
      screen: ScheduleScreen,
      navigationOptions: {
        header: null,
      },
    },
    Absent: {
      screen: AbsentScreen,
      navigationOptions: {
        headerShown: false,
      },
    },
    DirectCheckin: {
      screen: DirectCheckinScreen,
      navigationOptions: {
        headerShown: false,
      },
    },
    Checkin: {
      screen: CheckinScreen,
      navigationOptions: {
        headerShown: false,
      },
    },
    Checkout: {
      screen: CheckoutScreen,
      navigationOptions: {
        headerShown: true,
      },
    },
    ClientDB: {
      screen: ClientDBScreen,
      navigationOptions: {
        headerShown: true,
      },
    },
    CreateClientScreen: {
      screen: CreateClientScreen,
      navigationOptions: {
        headerShown: true,
      },
    },
    ResourceScreen: {
      screen: ResourceScreen,
      navigationOptions: {
        headerShown: true,
      },
    },
  },
  {
    initialRouteName: 'Home',
  },
);

const AbsentStack = createSwitchNavigator(
  {
    Absent: {
      screen: AbsentScreenEnhancement,
      navigationOptions: {
        header: null,
      },
    },
    AbsentDetail: {
      screen: AbsentDetailScreen,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    initialRouteName: 'Absent',
  },
);


export const MainStack = createMaterialBottomTabNavigator(
  {
    Home: {
      screen: HomeStack,
      navigationOptions: {
        tabBarLabel: 'Home',
        tabBarIcon: ({ tintColor }) => (
          <FeatherIcon name="home" size={18} color={tintColor} />
        )
      }
    },
    Absent: {
      screen: AbsentStack,
      navigationOptions: {
        tabBarLabel: 'Absent',
        tabBarIcon: ({ tintColor }) => (
          <FeatherIcon name="user-check" size={18} color={tintColor} />
        )
      }
    },
  },
  {
    initialRouteName: 'Home',
    barStyle: {
      backgroundColor: '#3876BF'
    }
  },
);
