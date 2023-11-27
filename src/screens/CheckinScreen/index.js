import React, { Component } from 'react';
import { connect } from "react-redux";
import { View, BackHandler, Modal, ImageBackground, TouchableOpacity, Image, Text, TextInput, Alert } from 'react-native';
import WaitingDialog from "../../components/waitingDialog";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scrollview";
import ShakingText from 'react-native-shaking-text';
import { AppStyles } from "../../styles/styles";
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import { SERVER_URL } from "../../common/config";
import Geolocation from 'react-native-geolocation-service';
import { getPreciseDistance } from 'geolib';
import { Platform, } from 'react-native';
import SimpleToast from "react-native-simple-toast";
import styles from './style'
import { createMapTrackingActions } from '../../redux/actions/CreateMapTracking';
import { getUniqueId } from 'react-native-device-info';
import { launchCamera } from 'react-native-image-picker';
import { customFormService } from '../../services/customForm/CustomForm';
import { requestCameraPermission } from '../../utils/permissions';

class CheckinScreen extends Component {

    constructor(props) {
        super();
        this.state = {
            geoAddress: '',
            isLoading: false,
            schedule_items: [],
            schedule_id: props.navigation.state.params?.client_info?.schedule_id,
            client_id: props.navigation.state.params?.client_info?.client_id,
            date: '',
            time: '',
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
            upload_picture: '',
            upload_picture_name: '',
            customUploadField: {}
        };
        this.getCurrentLocation()
    }

    componentDidMount() {
        const { navigation } = this.props;
        navigation.addListener('willFocus', async () => {
            BackHandler.addEventListener('hardwareBackPress', () => this.onBackButtonClicked());
        });
        navigation.addListener('willBlur', () => {
            BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonClicked);
        });
        this.fetchCustomUploadField()
        this.getScheduleItems()
        let curDate = this.getCurrentDate()
        let curTime = this.getCurrentTime()
        let formatDate = this.getNiceDate()
        let formatTime = this.getNiceTime()
        this.setState(
            {
                ...this.state,
                date: curDate,
                time: curTime,
                niceDate: formatDate,
                niceTime: formatTime
            }
        )

    }

    async fetchCustomUploadField() {
        const user = await AsyncStorage.getItem('user')
        const parsedUser = JSON.parse(user);
        const customUploadField = await customFormService.getCustomUploadField(parsedUser.company_id, 'check_in')
        this.setState({
            ...this.state,
            customUploadField
        })
    }

    getScheduleItems() {
        AsyncStorage.getItem('user_id').then((value) => {
            console.log("get full name===>", value)

            this.setState({
                ...this.state,
                user_id: value,
            })
            let body = {
                user_id: value
            }
            fetch(`${SERVER_URL}getCheckinScheduleByUserId`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
                .then(res => {
                    return res.json()
                })
                .then(res => {
                    if (res.error) {
                        throw (res.error);
                    }
                    console.log(res, "resssss")
                    let scheduleData = res
                    // console.log(scheduleData)
                    var schedule_items = []
                    let currentDate = new Date()
                    let startDateTime = moment(currentDate).startOf('day');
                    let endDateTime = moment(currentDate).endOf('day');
                    console.log('endDateTime===>', endDateTime)
                    scheduleData.filter(function (fitem) {
                        return (moment(fitem.schedule_datetime) > startDateTime && moment(fitem.schedule_datetime) < endDateTime);
                    }).map(item => {
                        console.log(item, "itemmzzzz")
                        let datetime = item.schedule_datetime;
                        let client_name = item.client_entity_name;
                        let client_id = item.client_id
                        let schedule_id = item.schedule_id
                        let listItem = {
                            label: datetime + " " + client_name,
                            value: schedule_id,
                            client_id: client_id
                        }
                        schedule_items.push(listItem)

                    })
                    console.log(schedule_item, "schedule_item")
                    this.setState({
                        ...this.state,
                        schedule_items: schedule_items,
                        client_id: schedule_item[0].client_id
                    })

                    return true;
                })
                .catch(error => {
                    return (error)
                })
        })
    }

    getCurrentLocation() {
        Geolocation.getCurrentPosition(
            //Will give you the current location
            (position) => {
                // setLocationStatus('You are Here');

                //getting the Longitude from the location json
                const currentLongitude =
                    JSON.stringify(position.coords.longitude);

                //getting the Latitude from the location json
                const currentLatitude =
                    JSON.stringify(position.coords.latitude);

                this.reverseGeocode(currentLatitude, currentLongitude)
                .then((address) => {
                    if (address) {
                    console.log('hello')
                    console.log("Formatted Address:", address);
                    this.setState({
                        ...this.state,
                        geoAddress: address,
                    })
                    }
                })
                .catch((error) => {
                    console.error(error);
                });

                this.setState({
                    ...this.state,
                    latitude: currentLatitude,
                    longitude: currentLongitude
                })
            },
            (error) => {
                SimpleToast.show(error)
                this.setState({
                    ...this.state,
                    error: error
                })
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 3000 },
        );
    }

    getCurrentDate() {
        return moment(new Date()).format("YYYY-MM-DD")
    }

    getNiceDate() {
        return moment(new Date()).format("D MMMM YYYY");
    }

    getCurrentTime() {
        return moment(new Date()).format("HH:mm:ss")
    }

    getNiceTime() {
        return moment(new Date()).format("HH:mm")
    }


    onBackButtonClicked = () => {
        this.props.navigation.navigate("Home");
        return true;
    }

    reverseGeocode = async (latitude, longitude) => {
        try {
            const response = await fetch(
                `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${GOOGLE_MAP_API_KEY}`
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
            throw new Error("No results found.");
          }
        } catch (error) {
          console.error('reverseGeocode error', error);
          return null;
        }
    }

    formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    updateLoadingStatus = bool => {
        this.setState({ isLoading: bool });
    }

    selectPhoto = async () => {
        const permissionGranted = await requestCameraPermission();
            if (!permissionGranted) {
                return
            }
        var options = {
            title: 'Take a Photo', // Change the title to reflect taking a photo
            mediaType: 'photo', // Specify that you want to capture a photo
        };
    
        launchCamera(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled taking a photo');
            } else if (response.errorMessage) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else {
                console.log('User took a photo', response.assets[0].uri);
                const data = new FormData();
                data.append('name', 'avatar');
                data.append('fileData', {
                    uri: response.assets[0].uri,
                    type: response.assets[0].type,
                    name: response.assets[0].fileName
                });
                const config = {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'multipart/form-data',
                    },
                    body: data,
                };
                fetch(`${SERVER_URL}upload`, config)
                    .then((res) => {
                        console.log(res);
                        return res.json()
                    })
                    .then(res => {
                        console.log(res);
                        if (res?.path?.split?.('\\')?.[1] || res.name) {
                            SimpleToast.show("Image uploaded successfully")
                            this.setState({
                                ...this.state,
                                upload_picture: res?.path?.split?.('\\')?.[1] || res.name,
                                upload_picture_name: response.assets[0].fileName
                            })
                        }
                        return true
                    })
                    .catch((err) => {
                        console.log(err)
                        SimpleToast.show("Image failed to upload. Try Again!")
                    })
            }
        })
    }

    checkin = async () => {
        if (this.state.schedule_id === 0) {
            this.setState({ error: 'No schedule' });
            SimpleToast.show("No schedule.")
        } else {
            //Get Client Info--Location

            const user = await AsyncStorage.getItem('user')
            const parsedUser = JSON.parse(user);
            const deviceId = await getUniqueId()
            let mapTrackingBody = {
                user_id: parsedUser.user_id,
                full_name: parsedUser.full_name,
                company_id: parsedUser.company_id,
                device_id: deviceId,
                lat: this.state.latitude,
                long: this.state.longitude,
                os: 'android'
            }
            fetch(`${SERVER_URL}createMapTracker`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mapTrackingBody)
            })

            let body = {
                client_id: this.state.client_id
            }
            fetch(`${SERVER_URL}getClientProfileById`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
                .then(res => {
                    return res.json()
                })
                .then(res => {
                    if (res.error) {
                        throw (res.error);
                    }

                    let c_lat = res.location.split(' ')[0]
                    let c_lon = res.location.split(' ')[1]
                    console.log('Client Location ==> ', c_lat, c_lon)
                    this.setState({
                        ...this.state,
                        client_latitude: c_lat,
                        client_longitude: c_lon
                    })
                    console.log("asdasdasd")
                    this.calculatePreciseDistance()
                    return true;
                })
                .catch(error => {
                    console.log(error)
                    return (error)
                })
            //this.processCheckin();
        }
    }

    calculatePreciseDistance = () => {
        var pdis = getPreciseDistance(
            { latitude: this.state.latitude, longitude: this.state.longitude },
            { latitude: this.state.client_latitude, longitude: this.state.client_longitude },
        );
        console.log("Distance====>", pdis)
        if (pdis > 3000) {
            SimpleToast.show(`You are ${pdis} metres away from client.`)
        } else {
            this.processCheckin();
        }
    };

    processCheckin = async () => {
        if (this.state.customUploadField?.enable && this.state.customUploadField?.required) {
            if (!this.state.upload_picture?.length) {
                SimpleToast.show("Upload Image is Required")
                return
            }
        }
        //Check if it is in 3000m

        console.log(this.state.schedule_id, this.state.date + " " + this.state.time)
        let body = {
            schedule_id: this.state.schedule_id,
            check_in_datetime: this.state.date + " " + this.state.time,
            upload_picture: this.state.upload_picture,
        }
        fetch(`${SERVER_URL}checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
            .then(res => {
                return res.json()
            })
            .then(res => {
                if (res.error) {
                    throw (res.error);
                }
                console.log("Checkin response === > ", res)
                SimpleToast.show("Checkin Success!")
                this.setState({
                    schedule_id: 0,
                    schedule_items: [],
                })
                this.componentDidMount()
                this.props.navigation.navigate("Home");

                return true;
            })
            .catch(error => {
                return (error)
            })
    }

    render() {
        console.log(this.state.client_info)
        return (
            <View style={styles.container}>
                {/* <StatusBarPlaceHolder /> */}
                <KeyboardAwareScrollView contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', alwaysBounceVertical: true }}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag">
                    <View style={styles.avatarContainer}>
                        <View style={{ position: 'absolute', left: 0 }}>
                            <TouchableOpacity style={styles.backButton} onPress={() => this.onBackButtonClicked()}>
                                <Image style={styles.backButtonIcon} source={require('../../assets/arrow_back.png')} />
                            </TouchableOpacity>
                        </View>
                        <Image source={require('../../assets/scouthippo.png')} style={{ width: 48, height: 48 }} />
                    </View>
                    <View style={styles.loginContainer}>
                        <ShakingText style={styles.error}>{this.state.error}</ShakingText>
                        <View>
                            <Text style={{ fontWeight: 'bold', fontSize: 30, marginBottom: 5, marginTop: 10, alignSelf: 'center' }}>Check In</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.informationContainer}>
                            <View style={styles.row}>
                                <View style={styles.rowItem}>
                                    <Image style={styles.otherIcon} source={require('../../assets/calendar.png')} />
                                    <Text style={{fontWeight: 'bold', fontSize: 16}}>Tanggal: {this.state.niceDate}</Text>
                                </View>
                                <View style={styles.rowItem}>
                                    <Image style={styles.otherIcon} source={require('../../assets/clock.png')} />
                                    <Text style={{fontWeight: 'bold', fontSize: 16}}>Waktu: {this.state.niceTime}</Text>
                                </View>
                                <View style={styles.rowItem}>
                                    <Image style={styles.otherIcon} source={require('../../assets/maps_location.png')} />
                                    <Text style={{fontWeight: 'bold', fontSize: 16}}>Lokasi: {this.state.geoAddress == '' ? `${this.state.latitude}, ${this.state.longitude}` : this.state.geoAddress}</Text>
                                </View>
                                <View style={styles.rowItem}>
                                    <Image style={styles.otherIcon} source={require('../../assets/user.png')} />
                                    <Text style={{fontWeight: 'bold', fontSize: 16}}>Klien: {this.state.client_info.client_entity_name}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={{marginBottom: 10}} />
                        {
                            this.state.customUploadField?.enable && (
                                <View>
                                    <Text style={{ alignSelf: 'center', fontSize: 15 }}>UPLOAD</Text>
                                    <TouchableOpacity style={styles.cameraButton} onPress={this.selectPhoto}>
                                        <Image style={styles.backButtonIcon} source={require('../../assets/camera.png')} />
                                    </TouchableOpacity>
                                    <Text style={{ alignSelf: 'center', fontSize: 12, marginBottom: 20 }}>{ ((this.state.upload_picture_name).length > 10) ? 
                                        ('...' + ((this.state.upload_picture_name).substring(this.state.upload_picture_name.length - 10, this.state.upload_picture_name.length))) : 
                                        this.state.upload_picture_name }
                                    </Text>
                                </View>
                            )
                        }

                        <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={this.checkin}>
                            <Text style={AppStyles.text}>CHECK IN</Text>
                        </TouchableOpacity>
                    </View>

                </KeyboardAwareScrollView>

                <Modal transparent={true} visible={this.state.isLoading} animationType='fade'
                    onRequestClose={() => this.updateLoadingStatus(false)}>
                    <WaitingDialog />
                </Modal>
            </View>
        );
    }
}

const mapStateToProps = state => {
    return {}
}

const mapDispatchToProps = dispatch => {
    return {
        // userActions: bindActionCreators(userActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckinScreen);