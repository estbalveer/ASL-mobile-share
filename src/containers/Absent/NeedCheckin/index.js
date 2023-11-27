import React, {useState, useEffect, useContext} from 'react';
import {Image, Text, View, TouchableOpacity} from 'react-native';
import {Avatar} from 'react-native-paper';
import {getInitials} from '../../../utils/string';
import styles from './style';
import {AppStyles} from '../../../styles/styles';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import FeatherIcon from 'react-native-vector-icons/Feather'
import { NavigationContext } from 'react-navigation';

const NeedCheckin = () => {
  const [currentDate, setCurrentDate] = useState(
    moment(new Date()).format('D MMMM YYYY'),
  );
  const [currentTime, setCurrentTime] = useState(
    moment(new Date()).format('HH:mm:ss'),
  );

  const navigation = useContext(NavigationContext);

  const handleNavigateToDetail = () => {
    navigation.navigate('AbsentDetail')
  }

  useEffect(() => {
    const time = setInterval(() => {
      setCurrentTime(moment(new Date()).format('HH:mm:ss'))
    }, 1000)

    return () => {
      clearInterval(time);
    }

  }, []);

  return (
    <View style={styles.absentContainer}>
      <View style={styles.checkinContainer}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontSize: 14,
              color: '#fff',
              paddingHorizontal: 4,
              paddingVertical: 2,
              backgroundColor: '#D83F31',
              borderRadius: 6,
              marginRight: 8,
            }}>
            Belum Checkin
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.informationContainer}>
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <FeatherIcon style={styles.otherIcon} name="calendar" size={16} />
              <Text style={{fontWeight: 'bold', fontSize: 16}}>
                Tanggal: -
              </Text>
            </View>
            <View style={styles.rowItem}>
              <FeatherIcon style={styles.otherIcon} name="clock" size={16} />
              <Text style={{fontWeight: 'bold', fontSize: 16}}>
                Waktu: -
              </Text>
            </View>
            <View style={styles.rowItem}>
              <FeatherIcon style={styles.otherIcon} name="map-pin" size={16} />
              <Text style={{fontWeight: 'bold', fontSize: 16}}>
                Lokasi: -
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={{
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18
      }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#000',
            textAlign: 'center'
          }}
        >
          {currentDate}
        </Text>
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#000',
            textAlign: 'center'
          }}
        >
          {currentTime}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={handleNavigateToDetail}>
        <Text style={AppStyles.text}>CLOCK IN</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NeedCheckin;
