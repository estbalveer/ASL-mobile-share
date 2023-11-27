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
import { Platform, TouchableWithoutFeedback} from 'react-native';
import SimpleToast from "react-native-simple-toast";
import { launchCamera } from 'react-native-image-picker';
import styles from './style'
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import { customFormService } from '../../services/customForm/CustomForm';
import { requestCameraPermission } from '../../utils/permissions';

class CheckinScreen extends Component {

    constructor(props) {
        super();
        this.state = {
            geoAddress: '',
            niceDate: '',
            niceTime: '',
            isLoading: false,
            date: '',
            time: '',
            latitude: '',
            longitude: '',
            overtime_notes: '',
            error: '',
            user_id: '',
            upload_picture: null,
            upload_picture_name: null,
            isUploadLoading: false,
            absent: {
                isLoading: false,
                isCheckIn: false,
                isCheckOut: false,
                absentFeature: false
            },
            customUploadField: {}
        };
        this.getCurrentLocation()
    }

    componentDidMount() {
        this.getAbsent()
        const { navigation } = this.props;
        navigation.addListener('willFocus', async () => {
            BackHandler.addEventListener('hardwareBackPress', () => this.onBackButtonClicked());
        });
        navigation.addListener('willBlur', () => {
            BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonClicked);
        });
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

    updateLoadingStatus = bool => {
        this.setState({ isLoading: bool });
    }

    async fetchCustomUploadField() {
        const user = await AsyncStorage.getItem('user')
        const parsedUser = JSON.parse(user);
        const customUploadField = await customFormService.getCustomUploadField(parsedUser.company_id, this.state.absent.isCheckIn ? 'absent_out' : 'absent_in')
        this.setState({
            ...this.state,
            customUploadField
        })
    }

    getAbsent = async () => {
        try {
          this.setState({
            absent: {
              ...this.state.absent,
              isLoading: true
            }
          })
          const user_id = await AsyncStorage.getItem('user_id')
          const company_id = await AsyncStorage.getItem('company_id')
          const response = await axios.post(`${SERVER_URL}getAbsentV2`, {
            company_id,
            user_id,
            date: moment(new Date()).format('YYYY-MM-DD')
          })
          this.setState({
            absent: {
              ...this.state.absent,
              isCheckIn: !!response?.data?.payload?.check_in_datetime,
              isCheckOut: !!response?.data?.payload?.check_out_datetime,
              absentFeature: !!response?.data?.payload?.absent_feature
            }
          })
          return response?.data
        } catch (error) {
            SimpleToast.show("Something went wrong");
            this.props.navigation.navigate("Home");
        } finally {
            this.fetchCustomUploadField()
          this.setState({
            absent: {
              ...this.state.absent,
              isLoading: false
            }
          })
        }
      }

    // selectPhotoOld = () => {
    //     var options = {
    //         title: 'Select Image',
    //         mediaType: "photo",
    //         storageOptions: {
    //             skipBackup: true,
    //             path: 'images'
    //         }
    //     };
    //     showImagePicker(options, (response) => {
    //         this.setState({
    //             isUploadLoading: true
    //         })
    //         if (response.didCancel) {
    //             console.log('User cancelled image picker');
    //             this.setState({
    //                 isUploadLoading: false
    //             })
    //         } else if (response.error) {
    //             console.log('ImagePicker Error: ', response.error);
    //         } else if (response.customButton) {
    //             console.log('User tapped custom button: ', response.customButton);
    //         } else {
    //             console.log('User selected a file form camera or gallery', response.uri);
    //             const data = new FormData();
    //             data.append('name', 'avatar');
    //             data.append('fileData', {
    //                 uri: response.uri,
    //                 type: response.type,
    //                 name: response.fileName
    //             });
    //             const config = {
    //                 method: 'POST',
    //                 headers: {
    //                     'Accept': 'application/json',
    //                     'Content-Type': 'multipart/form-data',
    //                 },
    //                 body: data,
    //             };
    //             fetch(`${SERVER_URL}upload`, config)
    //                 .then((res) => {
    //                     console.log(res);
    //                     return res.json()
    //                 })
    //                 .then(res => {
    //                     console.log(res);
    //                     if (res?.path?.split?.('\\')?.[1] || res.name) {
    //                         SimpleToast.show("Image uploaded successfully")
    //                         this.setState({
    //                             ...this.state,
    //                             upload_picture: res?.path?.split?.('\\')?.[1] || res.name,
    //                             upload_picture_name: response.fileName
    //                         })
    //                     }
    //                     return true
    //                 })
    //                 .catch((err) => { console.log(err) })
    //                 .finally(() => {
    //                     this.setState({
    //                         isUploadLoading: false
    //                     })
    //                 })
    //         }
    //     })
    // }

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
            this.setState({
                isUploadLoading: true
            });
    
            if (response.didCancel) {
                console.log('User cancelled taking a photo');
                this.setState({
                    isUploadLoading: false
                })
            } else if (response.errorMessage) {
                console.log('ImagePicker Error: ', response.errorMessage);
                this.setState({
                    isUploadLoading: false
                })
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
                    .finally(() => {
                        this.setState({
                            isUploadLoading: false
                        })
                    })
            }
        })
    }

    processCheckin = async () => {
        if (this.state.customUploadField.enable && this.state.customUploadField.required) {
            if (!this.state.upload_picture?.length) {
                SimpleToast.show("Upload Image is Required")
                return
            }
        }
        const user_id = await AsyncStorage.getItem('user_id')
        const company_id = await AsyncStorage.getItem('company_id')
        let body = {
            user_id: user_id,
            company_id: company_id,
            date_time: this.state.date + " " + this.state.time,
            image: this.state.upload_picture,
            lat: this.state.latitude,
            long: this.state.longitude,
            overtime_notes: this.state.overtime_notes
        }
        fetch(`${SERVER_URL}${this.state.absent.isCheckIn ? 'checkOutAbsent' : 'checkInAbsent'}`, {
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
                SimpleToast.show(`${this.state.absent.isCheckIn ? 'Checkout' : 'Checkin'} Success!`)
                this.props.navigation.navigate("Home");
                return true;
            })
            .catch(error => {
                return (error)
            })
    }

    handleOvertimeNotes = (text) => {
        this.setState({
            overtime_notes: text
        })
    }

    render() {
        console.log(this.state, 'this.state')
        return (
            <>
                <Spinner
                    visible={this.state.isUploadLoading}
                    color="#5589e6"
                    size={48}
                />
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
                            {
                                !this.state.absent.isLoading && (
                                    <View>
                                        <Text style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: 30, marginBottom: 15, marginTop: 10 }}>
                                            {this.state.absent.isCheckIn ? 'Absen Keluar' : 'Absen Masuk'}
                                        </Text>
                                    </View>
                                )
                            }
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
                                </View>
                            </View>
                            <View style={styles.divider} />
                            <View style={{marginBottom: 10}} />
                            {
                                this.state.absent.isCheckIn && (
                                    <View style={{
                                        ...styles.inputContainer,
                                        height: 70
                                    }}>
                                        <Image style={styles.inputIcon} source={require('../../assets/description.png')} />
                                        <TextInput
                                            placeholder='Notes Lembur'
                                            multiline={true}
                                            numberOfLines={4}
                                            style={styles.inputNotes}
                                            value={this.state.overtime_notes}
                                            onChangeText={this.handleOvertimeNotes}
                                        />
                                    </View>
                                )
                            }
                            {
                                this.state.customUploadField.enable && (
                                    <TouchableOpacity onPress={this.selectPhoto}>
                                        <View style={styles.uploadContainer}>
                                            <Text style={{ alignSelf: 'center', fontSize: 15 }}>Upload Foto</Text>
                                            
                                            <Image style={{width: 15, height: 15, marginLeft: 7}} source={require('../../assets/upload.png')} />
                                         </View>
                                        <Text style={{ alignSelf: 'center', fontSize: 12, marginBottom: 5 }}>
                                            { ((this.state.upload_picture_name)?.length > 10) ? 
                                            ('...' + ((this.state.upload_picture_name)?.substring?.(this.state.upload_picture_name?.length - 10, this.state.upload_picture_name?.length))) : 
                                            this.state.upload_picture_name 
                                            }
                                        </Text>
                                    </TouchableOpacity>
                                )
                            }

                            {
                                !this.state.absent.isLoading && (
                                    <TouchableOpacity
                                        style={styles.buttonContainer}
                                        onPress={this.processCheckin}>
                                        <Text style={AppStyles.text}>
                                            {this.state.absent.isCheckIn ? 'CHECK OUT' : 'CHECK IN'}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            }

                        </View>

                    </KeyboardAwareScrollView>

                    <Modal transparent={true} visible={this.state.isLoading} animationType='fade'
                        onRequestClose={() => this.updateLoadingStatus(false)}>
                        <WaitingDialog />
                    </Modal>
                </View>
            </>
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