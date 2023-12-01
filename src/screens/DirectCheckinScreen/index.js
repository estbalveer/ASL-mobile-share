import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  BackHandler,
  Modal,
  ImageBackground,
  TouchableOpacity,
  Image,
  Text,
  TextInput,
  Alert,
} from 'react-native';
import WaitingDialog from '../../components/waitingDialog';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import ShakingText from 'react-native-shaking-text';
import {AppStyles} from '../../styles/styles';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import {GOOGLE_MAP_API_KEY, SERVER_URL} from '../../common/config';
import Geolocation from 'react-native-geolocation-service';
import {getPreciseDistance} from 'geolib';
import {Platform, TouchableWithoutFeedback} from 'react-native';
import SimpleToast from 'react-native-simple-toast';
import styles from './style';
import {getUniqueId} from 'react-native-device-info';
import SelectDropdown from 'react-native-select-dropdown';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import {customFormService} from '../../services/customForm/CustomForm';
import {launchCamera} from 'react-native-image-picker';
import {requestCameraPermission} from '../../utils/permissions';
import Spinner from 'react-native-loading-spinner-overlay';

class DirectCheckinScreen extends Component {
  constructor(props) {
    super();
    this.state = {
      geoAddress: '',
      isLoading: false,
      schedule_items: [],
      date: '',
      niceDate: '',
      time: '',
      niceTime: '',
      latitude: '',
      longitude: '',
      client_latitude: '',
      client_longitude: '',
      predicted_time_spent: 0,
      datePickerVisible: false,
      timePickerVisible: false,
      error: '',
      user_id: '',
      client_info: props.navigation.state.params?.client_info,
      visiting_reason: [],
      isVisitingReasonLoading: false,
      client_entity_name: '',
      phone_number: '',
      custom_field: '',
      address: '',
      selected_reason: {},
      products: [],
      selected_product: [],
      isProductDropdownOpen: false,
      customUploadField: {},
      upload_picture: '',
      upload_picture_name: '',
      isUploadLoading: false,
    };
    this.getCurrentLocation();
    this.fetchCustomUploadField();
  }

  componentDidMount() {
    const {navigation} = this.props;
    navigation.addListener('willFocus', async () => {
      BackHandler.addEventListener('hardwareBackPress', () =>
        this.onBackButtonClicked(),
      );
    });
    navigation.addListener('willBlur', () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        this.onBackButtonClicked,
      );
    });

    this.getScheduleItems();
    this.getAllVisitingReason();
    this.getAllProduct();
    this.fetchCustomUploadField();
    let curDate = this.getCurrentDate();
    let curTime = this.getCurrentTime();
    let formatDate = this.getNiceDate();
    let formatTime = this.getNiceTime();
    this.setState({
      ...this.state,
      date: curDate,
      time: curTime,
      niceDate: formatDate,
      niceTime: formatTime,
    });
  }

  async fetchCustomUploadField() {
    const user = await AsyncStorage.getItem('user');
    const parsedUser = JSON.parse(user);
    const customUploadField = await customFormService.getCustomUploadField(
      parsedUser.company_id,
      'direct_check_in',
    );
    this.setState({
      ...this.state,
      customUploadField,
    });
  }

  getScheduleItems() {
    AsyncStorage.getItem('user_id').then((value) => {
      console.log('get full name===>', value);

      this.setState({
        ...this.state,
        user_id: value,
      });
      let body = {
        user_id: value,
      };
      fetch(`${SERVER_URL}getCheckinScheduleByUserId`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
      })
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          if (res.error) {
            throw res.error;
          }
          console.log(res, 'resssss');
          let scheduleData = res;
          // console.log(scheduleData)
          var schedule_items = [];
          let currentDate = new Date();
          let startDateTime = moment(currentDate).startOf('day');
          let endDateTime = moment(currentDate).endOf('day');
          console.log('endDateTime===>', endDateTime);
          scheduleData
            .filter(function (fitem) {
              console.log(moment(fitem.schedule_datetime));
              return (
                moment(fitem.schedule_datetime) > startDateTime &&
                moment(fitem.schedule_datetime) < endDateTime
              );
            })
            .map((item) => {
              console.log(item, 'itemmzzzz');
              let datetime = item.schedule_datetime;
              let client_name = item.client_entity_name;
              let client_id = item.client_id;
              let schedule_id = item.schedule_id;
              let listItem = {
                label: datetime + ' ' + client_name,
                value: schedule_id,
                client_id: client_id,
              };
              schedule_items.push(listItem);
            });
          console.log(schedule_item, 'schedule_item');
          this.setState({
            ...this.state,
            schedule_items: schedule_items,
            client_id: schedule_item[0].client_id,
          });

          return true;
        })
        .catch((error) => {
          return error;
        });
    });
  }

  async getAllVisitingReason() {
    const user = await AsyncStorage.getItem('user');
    const parsedUser = JSON.parse(user);
    let visitingReasonBody = {
      company_id: parsedUser.company_id,
    };
    this.setState({
      ...this.state,
      isVisitingReasonLoading: true,
    });
    fetch(`${SERVER_URL}getAllVisitingReason`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(visitingReasonBody),
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.error) {
          throw res.error;
        }
        this.setState({
          ...this.state,
          visiting_reason: res.data,
          isVisitingReasonLoading: false,
        });
      })
      .catch((error) => {
        return error;
      });
  }

  async getAllProduct() {
    const user = await AsyncStorage.getItem('user');
    const parsedUser = JSON.parse(user);
    let productBody = {
      company_id: parsedUser.company_id,
    };
    fetch(`${SERVER_URL}getAllProduct`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(productBody),
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.error) {
          throw res.error;
        }
        this.setState({
          ...this.state,
          products: res.data
            ?.filter((item) => item.name)
            .map((item) => {
              return {
                name: item.name,
                id: item.id,
              };
            }),
        });
      })
      .catch((error) => {
        return error;
      });
  }

  selectPhoto = async () => {
    const permissionGranted = await requestCameraPermission();
    if (!permissionGranted) {
      return;
    }
    var options = {
      title: 'Take a Photo', // Change the title to reflect taking a photo
      mediaType: 'photo', // Specify that you want to capture a photo
    };

    launchCamera(options, (response) => {
      this.setState({
        isUploadLoading: true,
      });
      if (response.didCancel) {
        console.log('User cancelled taking a photo');
        this.setState({
          isUploadLoading: false,
        });
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
        this.setState({
          isUploadLoading: false,
        });
      } else {
        console.log('User took a photo', response.assets[0].uri);
        // Retry logic for the upload
        const retryUpload = async (retryCount) => {
          try {
            const data = new FormData();
            data.append('fileData', {
              uri: response.assets[0].uri,
              type: response.assets[0].type,
              name: response.assets[0].fileName,
            });
            const config = {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
              },
              body: data,
            };

            const res = await fetch(`${SERVER_URL}upload`, config);
            console.log(res);

            if (res.ok) {
              const result = await res.json();
              if (result?.path?.split?.('\\')?.[1] || result.name) {
                SimpleToast.show('Image uploaded successfully');
                this.setState({
                  ...this.state,
                  upload_picture:
                    result?.path?.split?.('\\')?.[1] || result.name,
                  upload_picture_name: response.assets[0].fileName,
                });
              }
              return true;
            } else {
              throw new Error('HTTP error! Status: ' + res.status);
            }
          } catch (error) {
            console.log(error);
            console.log(
              'Image upload failed. Retrying...',
              'retry count: ' + (retryCount + 1),
            );
            if (retryCount < 3) {
              return retryUpload(retryCount + 1);
            } else {
              throw new Error(
                'Max retries reached. Unable to complete the request.',
              );
            }
          }
        };
        // Initial upload attempt
        retryUpload(0)
          .catch((err) => {
            console.error(err);
            SimpleToast.show('Image failed to upload. Try Again!');
          })
          .finally(() => {
            this.setState({
              isUploadLoading: false,
            });
          });
      }
    });
  };

  getCurrentLocation() {
    Geolocation.getCurrentPosition(
      //Will give you the current location
      (position) => {
        // setLocationStatus('You are Here');

        //getting the Longitude from the location json
        const currentLongitude = JSON.stringify(position.coords.longitude);

        //getting the Latitude from the location json
        const currentLatitude = JSON.stringify(position.coords.latitude);

        this.reverseGeocode(currentLatitude, currentLongitude)
          .then((address) => {
            if (address) {
              console.log('hello');
              console.log('Formatted Address:', address);
              this.setState({
                ...this.state,
                geoAddress: address,
              });
            }
          })
          .catch((error) => {
            console.error(error);
          });

        this.setState({
          ...this.state,
          latitude: currentLatitude,
          longitude: currentLongitude,
        });
      },
      (error) => {
        SimpleToast.show(error);
        this.setState({
          ...this.state,
          error: error,
        });
      },
      {enableHighAccuracy: false, timeout: 10000, maximumAge: 3000},
    );
  }

  getCurrentDate() {
    return moment(new Date()).format('YYYY-MM-DD');
  }

  getNiceDate() {
    return moment(new Date()).format('D MMMM YYYY');
  }

  getCurrentTime() {
    return moment(new Date()).format('HH:mm:ss');
  }

  getNiceTime() {
    return moment(new Date()).format('HH:mm');
  }

  onBackButtonClicked = () => {
    this.props.navigation.navigate('Home');
    return true;
  };

  updateLoadingStatus = (bool) => {
    this.setState({isLoading: bool});
  };

  checkin = async () => {
    if (this.state.schedule_id === 0) {
      this.setState({error: 'No schedule'});
      SimpleToast.show('No schedule.');
    } else {
      //Get Client Info--Location

      const user = await AsyncStorage.getItem('user');
      const parsedUser = JSON.parse(user);
      const deviceId = await getUniqueId();
      let mapTrackingBody = {
        user_id: parsedUser.user_id,
        full_name: parsedUser.full_name,
        company_id: parsedUser.company_id,
        device_id: deviceId,
        lat: this.state.latitude,
        long: this.state.longitude,
        os: 'android',
      };
      fetch(`${SERVER_URL}createMapTracker`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(mapTrackingBody),
      });
      this.calculatePreciseDistance();
      //this.processCheckin();
    }
  };

  calculatePreciseDistance = () => {
    var pdis = getPreciseDistance(
      {latitude: this.state.latitude, longitude: this.state.longitude},
      {
        latitude: this.state.client_latitude,
        longitude: this.state.client_longitude,
      },
    );
    console.log('Distance====>', pdis);
    if (pdis > 3000) {
      SimpleToast.show(`You are ${pdis} metres away from client.`);
    } else {
      this.processCheckin();
    }
  };

  processCheckin = async () => {
    if (
      this.state.customUploadField.enable &&
      this.state.customUploadField.required
    ) {
      if (!this.state.upload_picture) {
        SimpleToast.show('Upload image is Required');
        return null;
      }
    }
    //Check if it is in 3000m
    const user = await AsyncStorage.getItem('user');
    const parsedUser = JSON.parse(user);
    let body = {
      client_entity_name: this.state.client_entity_name,
      custom_field: this.state.custom_field,
      address: this.state.address,
      phone_number: this.state.phone_number,
      location: this.state.latitude + ' ' + this.state.longitude,
      company_id: parsedUser.company_id,
      schedule_datetime: this.state.date + ' ' + this.state.time,
      user_id: this.state.user_id,
      predicted_time_spent: 1,
      reason: this.state.selected_reason?.id,
      products: this.state.selected_product,
      check_in_datetime: this.state.date + ' ' + this.state.time,
      upload_picture: this.state.upload_picture,
    };
    fetch(`${SERVER_URL}createNewScheduleWithCheckin`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.error) {
          throw res.error;
        }
        console.log('Checkin response === > ', res);
        SimpleToast.show('Checkin Success!');
        this.setState({
          schedule_id: 0,
          schedule_items: [],
        });
        this.props.navigation.navigate('Home');

        return true;
      })
      .catch((error) => {
        return error;
      });
  };

  handleSelectVisitingReason = (selectedItem, index) => {
    this.setState({
      ...this.state,
      selected_reason: selectedItem,
      isVisitingReasonLoading: true,
    });
  };

  handleSetProductValue = (selected_product) => {
    this.setState((state) => ({
      selected_product,
    }));
  };

  reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${GOOGLE_MAP_API_KEY}`,
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('reverseGeocode data', data);

      if (data.results.length > 0) {
        const formattedAddress = data.results[0].formatted;
        console.log('Formatted Address:', formattedAddress);
        return formattedAddress;
      } else {
        throw new Error('No results found.');
      }
    } catch (error) {
      console.error('reverseGeocode error', error);
      return null;
    }
  };

  formatDate = (dateString) => {
    const options = {year: 'numeric', month: 'long', day: 'numeric'};
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  render() {
    return (
      <>
        <Spinner
          visible={this.state.isUploadLoading}
          color="#5589e6"
          size={48}
        />
        <View style={styles.container}>
          {/* <StatusBarPlaceHolder /> */}
          <KeyboardAwareScrollView
            contentContainerStyle={{
              justifyContent: 'center',
              alignItems: 'center',
              alwaysBounceVertical: true,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            <View style={styles.avatarContainer}>
              <View style={{position: 'absolute', left: 0}}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => this.onBackButtonClicked()}>
                  <Image
                    style={styles.backButtonIcon}
                    source={require('../../assets/arrow_back.png')}
                  />
                </TouchableOpacity>
              </View>
              <Image
                source={require('../../assets/scouthippo.png')}
                style={{width: 48, height: 48}}
              />
            </View>
            <View style={styles.loginContainer}>
              <ShakingText style={styles.error}>{this.state.error}</ShakingText>
              <View>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 30,
                    marginBottom: 5,
                    alignSelf: 'center',
                  }}>
                  Check In
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.informationContainer}>
                <View style={styles.row}>
                  <View style={styles.rowItem}>
                    <Image
                      style={styles.otherIcon}
                      source={require('../../assets/calendar.png')}
                    />
                    <Text style={{fontWeight: 'bold', fontSize: 16}}>
                      Tanggal: {this.state.niceDate}
                    </Text>
                  </View>
                  <View style={styles.rowItem}>
                    <Image
                      style={styles.otherIcon}
                      source={require('../../assets/clock.png')}
                    />
                    <Text style={{fontWeight: 'bold', fontSize: 16}}>
                      Waktu: {this.state.niceTime}
                    </Text>
                  </View>
                  <View style={styles.rowItem}>
                    <Image
                      style={styles.otherIcon}
                      source={require('../../assets/maps_location.png')}
                    />
                    <Text style={{fontWeight: 'bold', fontSize: 16}}>
                      Lokasi:{' '}
                      {this.state.geoAddress == ''
                        ? `${this.state.latitude}, ${this.state.longitude}`
                        : this.state.geoAddress}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={{marginBottom: 10}} />
              <View style={styles.inputContainer}>
                <Image
                  style={styles.inputIcon}
                  source={require('../../assets/ic_user_64dp.png')}
                />
                <TextInput
                  style={styles.time}
                  editable={true}
                  placeholder={'Nama Klien'}
                  onChangeText={(value) =>
                    this.setState({error: '', client_entity_name: value})
                  }>
                  {this.state.client_entity_name}
                </TextInput>
              </View>
              <View style={styles.inputContainer}>
                <Image
                  style={styles.inputIcon}
                  source={require('../../assets/mobile.png')}
                />
                <TextInput
                  style={styles.time}
                  editable={true}
                  placeholder={'Nomor Handphone Klien'}
                  keyboardType="numeric"
                  onChangeText={(value) =>
                    this.setState({error: '', phone_number: value})
                  }>
                  {this.state.phone_number}
                </TextInput>
              </View>
              <View style={styles.inputContainer}>
                <Image
                  style={styles.inputIcon}
                  source={require('../../assets/ic_aboutus_64dp.png')}
                />
                <TextInput
                  style={styles.time}
                  editable={true}
                  placeholder={'Keterangan Klien'}
                  onChangeText={(value) =>
                    this.setState({error: '', custom_field: value})
                  }>
                  {this.state.custom_field}
                </TextInput>
              </View>

              <View>
                <SelectDropdown
                  buttonStyle={styles.inputContainer}
                  buttonTextStyle={styles.inputDropdown}
                  data={this.state.visiting_reason}
                  onSelect={this.handleSelectVisitingReason}
                  defaultButtonText="Pilih Alasan Kunjungan"
                  buttonTextAfterSelection={(selectedItem, index) => {
                    // text represented after item is selected
                    // if data array is an array of objects then return selectedItem.property to render after item is selected
                    return selectedItem.name;
                  }}
                  rowTextForSelection={(item, index) => {
                    // text represented for each item in dropdown
                    // if data array is an array of objects then return item.property to represent item in dropdown
                    return item.name;
                  }}
                  renderDropdownIcon={() => {
                    // You can use any icon library or custom icon component here
                    return (
                      <View style={{paddingLeft: 10}}>
                        <FontAwesome
                          name={'caret-down'}
                          color={'#444'}
                          size={18}
                        />
                      </View>
                    );
                  }}
                  search
                  searchPlaceHolder={'Type here'}
                  renderSearchInputLeftIcon={() => {
                    return (
                      <FontAwesome name={'search'} color={'#444'} size={18} />
                    );
                  }}
                />
              </View>
              {this.state.selected_reason?.include_product ? (
                <SectionedMultiSelect
                  single={false}
                  styles={{
                    selectToggle: styles.inputContainer,
                    selectToggleText: {
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                    },
                  }}
                  searchPlaceholderText="Type here"
                  IconRenderer={MaterialIcons}
                  items={this.state.products}
                  uniqueKey="id"
                  subKey="children"
                  selectText="Select Products"
                  showDropDowns={true}
                  onSelectedItemsChange={this.handleSetProductValue}
                  selectedItems={this.state.selected_product}
                  showChips={false}
                />
              ) : null}
              {this.state.customUploadField?.enable && (
                <TouchableWithoutFeedback onPress={this.selectPhoto}>
                  <View>
                    <View style={styles.uploadContainer}>
                      <Text style={{alignSelf: 'center', fontSize: 15}}>
                        Upload Foto
                      </Text>

                      <Image
                        style={{width: 15, height: 15, marginLeft: 7}}
                        source={require('../../assets/upload.png')}
                      />
                    </View>
                    <Text style={{alignSelf: 'center', fontSize: 12}}>
                      {this.state.upload_picture_name.length > 10
                        ? '...' +
                          this.state.upload_picture_name.substring(
                            this.state.upload_picture_name.length - 10,
                            this.state.upload_picture_name.length,
                          )
                        : this.state.upload_picture_name}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              )}

              <TouchableOpacity
                style={styles.buttonContainer}
                onPress={this.checkin}>
                <Text style={AppStyles.text}>Check In</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>

          <Modal
            transparent={true}
            visible={this.state.isLoading}
            animationType="fade"
            onRequestClose={() => this.updateLoadingStatus(false)}>
            <WaitingDialog />
          </Modal>
        </View>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    // userActions: bindActionCreators(userActions, dispatch)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DirectCheckinScreen);
