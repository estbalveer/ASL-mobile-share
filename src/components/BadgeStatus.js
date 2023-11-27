import React from 'react';
import { Text } from 'react-native';
import { View } from 'react-native';

const BadgeStatus = ({type, children}) => {
  if (type === 'danger') {
    return (
      <View
        style={{
          backgroundColor: '#F84A4A',
          minWidth: 90,
          paddingVertical: 6,
          paddingHorizontal: 4,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 8,
        }}>
        <Text style={{color: 'white', fontSize: 12, fontWeight: '700'}}>
          {children}
        </Text>
      </View>
    );
  } else if (type === 'warning') {
    return (
      <View
        style={{
          backgroundColor: '#FBBB3F',
          minWidth: 90,
          paddingVertical: 6,
          paddingHorizontal: 4,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 8,
        }}>
        <Text style={{color: 'white', fontSize: 12, fontWeight: '700'}}>
          {children}
        </Text>
      </View>
    );
  } else if (type === 'success') {
    return (
      <View
        style={{
          backgroundColor: '#2ABB41',
          minWidth: 90,
          paddingVertical: 6,
          paddingHorizontal: 4,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 8,
        }}>
        <Text style={{color: 'white', fontSize: 12, fontWeight: '700'}}>
          {children}
        </Text>
      </View>
    );
  }
  return null
};

export default BadgeStatus;
