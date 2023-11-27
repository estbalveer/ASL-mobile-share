import React, {useState, useEffect, useMemo} from 'react';
import {Image, Text, View, TouchableOpacity} from 'react-native';
import styles from './style';
import {AppStyles} from '../../../styles/styles';
import moment from 'moment';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { getAddressFromCoordinates } from '../../../utils/location';

const AbsentDone = ({data}) => {
  const {
    checkinDatetime,
    checkinLatitude,
    checkinLongitude,
    checkoutDatetime,
    checkoutLatitude,
    checkoutLongitude,
  } = data
  const [checkinAddress, setCheckinAddress] = useState('')
  const [checkoutAddress, setCheckoutAddress] = useState('')
  const [currentDate, setCurrentDate] = useState(
    moment(new Date()).format('D MMMM YYYY'),
  );
  const [currentTime, setCurrentTime] = useState(
    moment(new Date()).format('HH:mm:ss'),
  );

  const checkinTime = useMemo(() => {
    return moment(checkinDatetime).format('HH:mm:ss');
  }, [checkinDatetime]);

  const checkoutTime = useMemo(() => {
    return moment(checkoutDatetime).format('HH:mm:ss');
  }, [checkoutDatetime]);

  const getAddress = async () => {
    try {
      if (checkinLatitude && checkinLongitude) {
        const checkinAddress = await getAddressFromCoordinates({
          latitude: checkinLatitude,
          longitude: checkinLongitude
        });
        setCheckinAddress(checkinAddress)
      }
      if (checkoutLatitude && checkoutLongitude) {
        const checkinAddress = await getAddressFromCoordinates({
          latitude: checkoutLatitude,
          longitude: checkoutLongitude
        });
        setCheckoutAddress(checkinAddress)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getAddress();
    const time = setInterval(() => {
      setCurrentTime(moment(new Date()).format('HH:mm:ss'));
    }, 1000);

    return () => {
      clearInterval(time);
    };
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
              backgroundColor: '#186F65',
              borderRadius: 6,
              marginRight: 8,
            }}>
            Checkin
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.informationContainer}>
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <FeatherIcon style={styles.otherIcon} name="calendar" size={16} />
              <Text style={{fontWeight: 'bold', fontSize: 16}}>
                Tanggal: {currentDate}
              </Text>
            </View>
            <View style={styles.rowItem}>
              <FeatherIcon style={styles.otherIcon} name="clock" size={16} />
              <Text style={{fontWeight: 'bold', fontSize: 16}}>
                Waktu: {checkinTime}
              </Text>
            </View>
            <View style={styles.rowItem}>
              <FeatherIcon style={styles.otherIcon} name="map-pin" size={16} />
              <Text
                style={{fontWeight: 'bold', fontSize: 16, maxWidth: '92%'}}
                numberOfLines={1} ellipsizeMode="tail"
              >
                Lokasi: {checkinAddress}
              </Text>
            </View>
          </View>
        </View>
      </View>
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
              backgroundColor: '#EE9322',
              borderRadius: 6,
              marginRight: 8,
            }}>
            Checkout
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.informationContainer}>
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <FeatherIcon style={styles.otherIcon} name="calendar" size={16} />
              <Text style={{fontWeight: 'bold', fontSize: 16}}>
                Tanggal: {currentDate}
              </Text>
            </View>
            <View style={styles.rowItem}>
              <FeatherIcon style={styles.otherIcon} name="clock" size={16} />
              <Text style={{fontWeight: 'bold', fontSize: 16}}>
                Waktu: {checkoutTime}
              </Text>
            </View>
            <View style={styles.rowItem}>
              <FeatherIcon style={styles.otherIcon} name="map-pin" size={16} />
              <Text
                style={{fontWeight: 'bold', fontSize: 16, maxWidth: '92%'}}
                numberOfLines={1} ellipsizeMode="tail"
              >
                Lokasi: {checkoutAddress}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default AbsentDone;
