import { PermissionsAndroid } from 'react-native';

export async function requestCameraPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'This app needs access to your camera to take pictures.',
        buttonPositive: 'OK',
      }
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    } else {
      console.log('Camera permission denied');
      return false;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
}