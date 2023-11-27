import React, { useEffect, useState } from 'react'
import { Button, PermissionsAndroid, Text, View, Linking, DeviceEventEmitter, Image } from 'react-native';
import RNLocation from 'react-native-location';
import RNModal from 'react-native-modal';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import { setUser } from '../redux/actions/UserAction';
import { createMapTrackingActions } from '../redux/actions/CreateMapTracking';
import { getUniqueId, getManufacturer, getDeviceId, getBrand, getModel, getProduct, getVersion, getDeviceName, getSystemVersion, getBuildNumber, getApiLevel } from 'react-native-device-info';
import Geolocation from 'react-native-geolocation-service';
import BackgroundService from 'react-native-background-actions';

const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

const options = {
  taskName: 'map_tracker',
  taskTitle: 'Scouthippo',
  taskDesc: 'Your are online',
  taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
  },
  color: '#ff00ff',
  linkingURI: 'scouthippo',
  parameters: {
      delay: 300000,
  },
};

  let locationSubscription = null;
  let locationTimeout = null;

const LiveTracking = () => {
    const [isLocationActive, setIsLocationActive] = useState(false)
    const [isGranted, setIsGranted] = useState(true)
    const login_user = useSelector(state => state.login_user)
    const dispatch = useDispatch()
    const user = useSelector(state => state.user)
    const androidVersion = Number(getSystemVersion().split('.')[0])

    useEffect(() => {
      AsyncStorage.getItem('user')
        .then(async value => {
          const userLoginData = JSON.parse(value);
          if (userLoginData && !userLoginData?.isAdmin) {
            RNLocation.configure({
              // distanceFilter: 100, // Meters
              desiredAccuracy: {
                ios: 'best',
                android: 'balancedPowerAccuracy',
              },
              // Android only
              androidProvider: 'auto',
              interval: 300000, // Milliseconds
              // iOS Only
              activityType: 'other',
              allowsBackgroundLocationUpdates: true,
              headingFilter: 1, // Degrees
              headingOrientation: 'portrait',
              pausesLocationUpdatesAutomatically: false,
              showsBackgroundLocationIndicator: false,
            });
          }
        })
    }, [])
    

    useEffect(() => {
      AsyncStorage.getItem('user')
        .then(async value => {
          const userLoginData = JSON.parse(value);
            if (userLoginData && !userLoginData?.isAdmin) {
                dispatch(setUser(JSON.parse(value)))
            } else {
              locationSubscription?.();
              clearTimeout(locationTimeout);
              await BackgroundService.stop()
            }
        })
    }, [login_user])

    useEffect(() => {
      AsyncStorage.getItem('user')
        .then(async value => {
          const userLoginData = JSON.parse(value);
          if (userLoginData && !userLoginData?.isAdmin) {
              if (isLocationActive) {
                handleStartLiveTracking()
              }
          }
          })
    }, [isGranted, login_user, isLocationActive])

    // useEffect(() => {
    //   AsyncStorage.getItem('user')
    //     .then(async value => {
    //        const userLoginData = JSON.parse(value);
    //       if (userLoginData && !userLoginData?.isAdmin) {
    //           handleWatchPosition()
    //       }
    //       })
    // }, [isGranted, login_user])

    useEffect(() => {
      let checkPermission = null;
      AsyncStorage.getItem('user')
        .then(async value => {
          const userLoginData = JSON.parse(value);
          if (userLoginData && !userLoginData?.isAdmin) {
            checkPermission = setInterval(async () => {
              const ACCESS_BACKGROUND_LOCATION = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION)
              const ACCESS_FINE_LOCATION = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
              const ACCESS_COARSE_LOCATION = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION)
              let isGranted = false;
              if (androidVersion > 10) {
                isGranted = ACCESS_BACKGROUND_LOCATION === 'granted'
              } else {
                isGranted = ACCESS_FINE_LOCATION === 'granted' && ACCESS_COARSE_LOCATION === 'granted'
              }
              handleWatchPosition()
              setIsGranted(isGranted)
            }, 3000);
          } else {
            clearInterval(checkPermission)
          }
        })
        return () => clearInterval(checkPermission)
    }, [setIsGranted, isGranted, login_user])

    const handleWatchPosition = () => {
      Geolocation.watchPosition(
        () => {
          setIsLocationActive(true)
        },
        (e) => {
          setIsLocationActive(false)
        },
        {
          useSignificantChanges: false,
          accuracy: {
            android: 'passive',
          },
          interval: 1000
        }
      );
      Geolocation.getCurrentPosition(
        () => {
          setIsLocationActive(true)
        },
        (e) => {
          setIsLocationActive(false)
        }
      );
    }

    const handlePermission = async () => {
        try {
            Linking.openSettings();
        } catch (error) {
            console.log(error, 'error click handle permission')
        }
    }
    
    const handleStartLiveTracking = async () => {
      if (!BackgroundService.isRunning() || !locationSubscription) {
          await BackgroundService.start(runTracker, options);
      }
    }

    const handleRemoveBackgroundTask = async () => {
      await BackgroundService.stop();
    }

    const addMapTracker = async ({
      lat,
      long
    }) => {
      const deviceId = await getUniqueId()
      const osVersion = getSystemVersion()
      const brandName = getBrand()
      const modelName = getModel()
      const appVersion = getVersion()
      const buildNumber = getBuildNumber()
      const apiLevel = await getApiLevel();
      dispatch(createMapTrackingActions.createMapTracking({
        user_id: user.user_id,
        full_name: user.full_name,
        company_id: user.company_id,
        lat,
        long,
        device_id: deviceId,
        os: 'android',
        os_version: osVersion,
        brand_name: brandName,
        model_name: modelName,
        app_version: appVersion,
        build_number: buildNumber,
        api_level: apiLevel,
      }))
    }

    const addMapTrackerAlternative = async (taskDataArguments) => {
      const { delay } = taskDataArguments;
      await new Promise( async (resolve) => {
          for (let i = 0; BackgroundService.isRunning(); i++) {
            Geolocation.getCurrentPosition(
                (position) => {
                    addMapTracker({
                      lat: position?.coords?.latitude,
                      long: position?.coords?.longitude,
                    })
                },
                (error) => {
                    console.log(error, 'errorrrrrrrrrrrrrrrrrrrrrrrrrr')
                },
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 3000 },
            );
            await sleep(delay);
          }
      });
  };

    const runTracker = async (e) => {
      await Promise.all([
        addMapTrackerAlternative(e),
        // Example of an infinite loop task
        new Promise( async (resolve) => {
          RNLocation.requestPermission({
            ios: 'whenInUse',
            android: {
              detail: 'fine',
            },
          }).then((granted) => {
            console.log('Location Permissions: ', granted);
            // if has permissions try to obtain location with RN location
            if (granted) {
              locationSubscription = RNLocation.subscribeToLocationUpdates(
                async ([locations]) => {
                  // locationSubscription();
                  // locationTimeout && clearTimeout(locationTimeout);
                  addMapTracker({
                    lat: locations.latitude,
                    long: locations.longitude,
                  })
                },
              );
            } else {
              locationSubscription && locationSubscription();
              locationTimeout && clearTimeout(locationTimeout);
              console.log('no permissions to obtain location');
            }
          }).catch(error => {
            console.log('error get location', error)
          });
        })
      ])
    };

    if (!Object.keys(user).length) {
        return null
    }

    return (
        <View>
            <RNModal
                isVisible={!isGranted}
                style={{
                    backdropColor: "#B4B3DB",
                    backdropOpacity: 0.8,
                    animationIn: "zoomInDown",
                    animationOut: "zoomOutUp",
                    animationInTiming: 600,
                    animationOutTiming: 600,
                    backdropTransitionInTiming: 600,
                    backdropTransitionOutTiming: 600,
                    backgroundColor: '#ffff'
                }}
            >
                <View style={{
                    paddingHorizontal: 18,
                    paddingHorizontal: 18,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                  <Image
                    source={require('../assets/setting.png')}
                    style={{
                      width: 200,
                      height: 200
                  }} />
                    <Text style={{
                        marginBottom: 8
                    }}>
                        Allow {androidVersion > 10 ? '"all the time"': ''} location permission
                    </Text>
                    <Button onPress={handlePermission} title="Allow Permission">
                    </Button>
                </View>
            </RNModal>
            <RNModal
            isVisible={!isLocationActive && isGranted}
            style={{
                backdropColor: "#B4B3DB",
                backdropOpacity: 0.8,
                animationIn: "zoomInDown",
                animationOut: "zoomOutUp",
                animationInTiming: 600,
                animationOutTiming: 600,
                backdropTransitionInTiming: 600,
                backdropTransitionOutTiming: 600,
                backgroundColor: '#ffff'
            }}
        >
            <View style={{
                paddingHorizontal: 18,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Image source={require('../assets/current_location.png')} style={{
                  width: 200,
                  height: 200
                }} />
                <Text style={{
                    marginTop: 10,
                    fontWeight: 'bold',
                    fontSize: 20
                }}>
                    Turn your location on
                </Text>
            </View>
        </RNModal>
            
        </View>
    )
}

export default LiveTracking