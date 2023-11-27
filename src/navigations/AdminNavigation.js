import React from 'react';
import HomeScreen from '../screens/Admin/Home';
import AbsentScreen from '../screens/Admin/Absent';
import ScheduleScreen from '../screens/Admin/Schedule';
import MapScreen from '../screens/Admin/Map';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs'
import FeatherIcon from 'react-native-vector-icons/Feather'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

export const AdminStack = createMaterialBottomTabNavigator(
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
    ScheduleAdmin: {
      screen: ScheduleScreen,
      navigationOptions: {
        tabBarLabel: 'Schedule',
        tabBarIcon: ({ tintColor }) => (
          <MaterialCommunityIcons name="calendar" size={18} color={tintColor} />
        )
      }
    },
    MapAdmin: {
      screen: MapScreen,
      navigationOptions: {
        tabBarLabel: 'Map',
        tabBarIcon: ({ tintColor }) => (
          <FeatherIcon name="map" size={18} color={tintColor} />
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
