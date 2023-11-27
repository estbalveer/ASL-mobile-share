import React, {useState, useEffect} from 'react';
import {View, Image, Text } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import {SERVER_URL} from '../../common/config';
import SimpleToast from 'react-native-simple-toast';
import styles from './style';
import axios from 'axios';
import NeedCheckin from '../../containers/Absent/NeedCheckin';
import {Spinner} from 'native-base';
import NeedCheckout from '../../containers/Absent/NeedCheckout';
import AbsentDone from '../../containers/Absent/AbsentDone';
import { withNavigationFocus } from 'react-navigation';

const AbsentScreen = (props) => {
  const [absent, setAbsent] = useState({
    isLoading: false,
    isCheckIn: false,
    isCheckOut: false,
    absentFeature: false,
    checkinDatetime: null,
    checkoutDatetime: null,
    checkinLatitude: null,
    checkinLongitude: null,
    checkoutLatitude: null,
    checkoutLongitude: null,
  });

  const getAbsent = async () => {
    try {
      console.log('get absent')
      setAbsent((prev) => ({
        ...prev,
        isLoading: true,
      }));
      const user_id = await AsyncStorage.getItem('user_id');
      const company_id = await AsyncStorage.getItem('company_id');
      const response = await axios.post(`${SERVER_URL}getAbsentV2`, {
        company_id,
        user_id,
        date: moment(new Date()).format('YYYY-MM-DD'),
      });
      setAbsent((prev) => ({
        ...prev,
        checkinDatetime: response?.data?.payload?.check_in_datetime,
        checkoutDatetime: response?.data?.payload?.check_out_datetime,
        checkinLatitude: response?.data?.payload?.check_in_lat,
        checkinLongitude: response?.data?.payload?.check_in_long,
        checkoutLatitude: response?.data?.payload?.check_out_lat,
        checkoutLongitude: response?.data?.payload?.check_out_long,
        isCheckIn: !!response?.data?.payload?.check_in_datetime,
        isCheckOut: !!response?.data?.payload?.check_out_datetime,
        companyLatitude: response?.data?.payload?.company_lat,
        companyLongitude: response?.data?.payload?.company_long,
        absentFeature: !!response?.data?.payload?.absent_feature,
      }));
      return response?.data;
    } catch (error) {
      SimpleToast.show('Something went wrong');
      props.navigation.navigate('Home');
    } finally {
      setAbsent((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  useEffect(() => {
    if (props.isFocused) {
      getAbsent();
    }
  }, [props.isFocused]);

  if (absent.isLoading) {
    return (
      <View style={styles.container}>
        <Spinner color="#5589e6" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image
          source={require('../../assets/scouthippo.png')}
          style={{width: 48, height: 48}}
        />
      </View>
      <View>
        <Text
          style={{
            alignSelf: 'center',
            fontWeight: 'bold',
            fontSize: 30,
            marginBottom: 15,
          }}>
          Absen
        </Text>
      </View>
      {
        absent.isCheckOut ? (
          <AbsentDone data={absent} />
        )
        : absent.isCheckIn ? (
          <NeedCheckout data={absent} />
        ) : (
          <NeedCheckin />
        )
      }
    </View>
  );
};

export default withNavigationFocus(AbsentScreen);
