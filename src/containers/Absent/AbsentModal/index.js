import React, { useEffect, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import ReactNativeModal from 'react-native-modal'
import styles from './styles'
import { Avatar } from 'react-native-paper'
import { getInitials } from '../../../utils/string'
import moment from 'moment'
import { GOOGLE_MAP_API_KEY } from '../../../common/config'
import axios from 'axios'

const AbsentModal = ({
  isOpen = false,
  onClose = () => null,
  data = {}
}) => {

  const [checkinAddress, setCheckinAddress] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('')

  const getTotalTime = () => {
    if (!data?.check_in_datetime || !data?.check_out_datetime) {
      return '-'
    }
    const checkin = moment(data?.check_in_datetime);
    const checkout = moment(data?.check_out_datetime);
    const duration = moment.duration(checkin.diff(checkout))
    const formattedDifference = moment.utc(duration.as('milliseconds')).format("HH:mm");
    return formattedDifference
  }

  const getAddressFromCoordinates = async ({ latitude, longitude }) => {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAP_API_KEY}`);
    if (response.data.status === 'OK') {
      const addressComponents = response.data.results[0].address_components;
      
      let district = '';
      let subdistrict = '';
      let city = '';

      addressComponents.forEach(component => {
        if (component.types.includes('administrative_area_level_2')) {
          district = component.long_name;
        } else if (component.types.includes('sublocality')) {
          subdistrict = ', ' + component.long_name;
        } else if (component.types.includes('locality')) {
          city = ', ' + component.long_name;
        }
      });

      return `${district}${subdistrict}${city}`
    } else {
      console.error('Geocoding request failed');
    }
  }

  const getAddress = async () => {
    if (data?.check_in_lat && data?.check_in_long) {
      const address = await getAddressFromCoordinates({
        latitude: data?.check_in_lat,
        longitude: data?.check_in_long,
      });
      setCheckinAddress(address)
    } else {
      setCheckinAddress('-')
    }
    if (data?.check_out_lat && data?.check_out_long) {
      const address = await getAddressFromCoordinates({
        latitude: data?.check_out_lat,
        longitude: data?.check_out_long,
      });
      setCheckoutAddress(address)
    } else {
      setCheckoutAddress('-')
    }
  };

  useEffect(() => {
    if (isOpen) {
      getAddress();
    }
  }, [isOpen])

  return (
    <ReactNativeModal
      isVisible={isOpen}
      onBackdropPress={onClose}
      style={{
      backdropColor: "#B4B3DB",
      backdropOpacity: 0.8,
      animationIn: "zoomInDown",
      animationOut: "zoomOutUp",
      animationInTiming: 600,
      animationOutTiming: 600,
      backdropTransitionInTiming: 600,
      backdropTransitionOutTiming: 600
      }}
  >
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Avatar.Text
            style={styles.avatar}
            size={64}
            label={getInitials(data?.full_name)}
          />
          <Text style={styles.nameText}>{data?.full_name}</Text>
        </View>
        <View style={styles.horizontalDivider}>
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{data?.check_in_datetime ? moment(data?.check_in_datetime).locale('en').format('ll') : '-'}</Text>
        </View >
        <View style={styles.timeContainer}>
          <View style={styles.timeTextWrapper}>
            <Text style={[styles.timeTitleText, styles.timeTitleCheckinText]}>Checkin</Text>
            <Text style={styles.timeDescriptionText}>{data?.check_in_datetime ? moment(data?.check_in_datetime).format('HH:mm') : '-'}</Text>
            <Text style={[styles.locationText, { textDecorationLine: 'underline' }]}>{checkinAddress}</Text>
          </View>
          <View style={styles.verticalDivider}></View>
          <View style={styles.timeTextWrapper}>
            <Text style={[styles.timeTitleText, styles.timeTitleCheckoutText]}>Checkout</Text>
            <Text style={styles.timeDescriptionText}>{data?.check_out_datetime ? moment(data?.check_out_datetime).format('HH:mm') : '-'}</Text>
            <Text style={[styles.locationText, { textDecorationLine: 'underline' }]}>{checkoutAddress}</Text>
          </View>
        </View >
        <View style={styles.horizontalDivider}>
        </View>
        <View style={styles.totalTimeContainer}>
          <Text style={[styles.totalTimeText, { fontWeight: '400' }]}>
            Total Time
          </Text>
          <Text style={styles.totalTimeText}>
            {getTotalTime()}
          </Text>
        </View>
      </View>
    </ReactNativeModal>
  )
}

export default AbsentModal