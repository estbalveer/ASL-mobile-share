import React, {useState, useEffect, useMemo} from 'react';
import {Image, Text, View, TouchableOpacity} from 'react-native';
import styles from './style';
import {AppStyles} from '../../../styles/styles';
import moment from 'moment';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { getAddressFromCoordinates } from '../../../utils/location';
import { useContext } from 'react';
import { NavigationContext } from 'react-navigation';

const NeedCheckout = ({data}) => {
  const {
    checkinDatetime,
    checkinLatitude,
    checkinLongitude,
  } = data
  const [checkinAddress, setCheckinAddress] = useState('')
  const [currentDate, setCurrentDate] = useState(
    moment(new Date()).format('D MMMM YYYY'),
  );
  const [currentTime, setCurrentTime] = useState(
    moment(new Date()).format('HH:mm:ss'),
  );

  const navigation = useContext(NavigationContext);

  const checkinTime = useMemo(() => {
    return moment(checkinDatetime).format('HH:mm:ss');
  }, [checkinDatetime]);

  const getAddress = async () => {
    try {
      const address = await getAddressFromCoordinates({
        latitude: checkinLatitude,
        longitude: checkinLongitude
      });
      setCheckinAddress(address)
    } catch (error) {
      console.log(error)
    }
  }

  const handleNavigateToDetail = () => {
    navigation.navigate('AbsentDetail')
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
        <Text style={AppStyles.text}>CLOCK OUT</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NeedCheckout;
