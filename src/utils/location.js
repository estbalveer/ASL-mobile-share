import axios from 'axios';
import {GOOGLE_MAP_API_KEY} from '../common/config';

export const getAddressFromCoordinates = async ({latitude, longitude}) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAP_API_KEY}`,
    );
    if (response.data.status === 'OK') {
      const addressComponents = response.data.results[0].address_components;
  
      let district = '';
      let subdistrict = '';
      let city = '';
  
      addressComponents.forEach((component) => {
        if (component.types.includes('administrative_area_level_2')) {
          district = component.long_name;
        } else if (component.types.includes('sublocality')) {
          subdistrict = ', ' + component.long_name;
        } else if (component.types.includes('locality')) {
          city = ', ' + component.long_name;
        }
      });
  
      return `${district}${subdistrict}${city}`;
    } else {
      console.error('Geocoding request failed');
    }
  } catch (error) {
    throw error
  }
};

export const isFarFromLocation = (checkInLat, checkInLong, latitude, longitude, threshold = 0.0045) => {
  const lat1Rad = (checkInLat * Math.PI) / 180;
  const lon1Rad = (checkInLong * Math.PI) / 180;
  const lat2Rad = (latitude * Math.PI) / 180;
  const lon2Rad = (longitude * Math.PI) / 180;

  const distance = Math.sqrt(Math.pow(lat1Rad - lat2Rad, 2) + Math.pow(lon1Rad - lon2Rad, 2));

  return distance > threshold;
}