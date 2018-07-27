import React from 'react';
import { StackNavigator } from 'react-navigation';
import {  StyleSheet, Text, View, TouchableHighlight } from 'react-native';

import History  from './History';
import Home  from './Home';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator } from 'react-navigation';

export default createBottomTabNavigator(
  {
    Home: {
      screen:Home,
      navigationOptions:{
        tabBarLabel:'最近',
        tabBarIcon: ({ focused, tintColor }) => {
          iconName = `ios-sunny${focused ? '' : '-outline'}`;
          return <Ionicons name={iconName} size={25} color={tintColor} />;
        },
      }
    },
    History: {
      screen: History,
      navigationOptions: {
        tabBarLabel:'历史',
        tabBarIcon: ({ focused, tintColor }) => {
          iconName = `ios-time${focused ? '' : '-outline'}`;
          return <Ionicons name={iconName} size={25} color={tintColor} />;
        },
        headerTitle:"历史"
      }
    },
  },
  {
    tabBarOptions: {
      activeTintColor: 'tomato',
      inactiveTintColor: 'gray',
    },
    tabBarPosition: 'bottom',
    swipeEnabled: true,
    animationEnabled: true,
    lazy: true,  
  }
);