import React, { Component, useRef } from 'react';
import { connect } from "react-redux";
import { View, BackHandler, Modal, TouchableOpacity, Image, Text, TextInput, PermissionsAndroid, TouchableHighlight } from 'react-native';
import styles from './style';
import StatusBarPlaceHolder from "../../components/statusbarPlaceHolder";
import WaitingDialog from "../../components/waitingDialog";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scrollview";
import ShakingText from 'react-native-shaking-text';
import { AppStyles } from '../../styles/styles';
import { launchCamera } from 'react-native-image-picker';
import SimpleToast from "react-native-simple-toast";
import AsyncStorage from '@react-native-community/async-storage';
import { SERVER_URL } from "../../common/config";
import Geolocation from 'react-native-geolocation-service';
import { getPreciseDistance } from 'geolib';
import moment from 'moment';
import SignatureCapture from 'react-native-signature-capture';

// import * as userActions from "../../redux/actions/userActions";
import { bindActionCreators } from "redux";
import { H1, Item } from 'native-base';
import { ScrollView } from 'react-native-gesture-handler';
import SelectDropdown from 'react-native-select-dropdown';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getUniqueId } from 'react-native-device-info';
import { customFormService } from '../../services/customForm/CustomForm';
import { screenWidth } from '../../styles/mixins';
import { requestCameraPermission } from '../../utils/permissions';

const createFormData = (photo, body) => {
    const data = new FormData();

    data.append('photo', {
        name: photo.fileName,
        type: photo.type,
        uri:
            Platform.OS === 'android' ? photo.uri : photo.uri.replace('file://', ''),
    });

    Object.keys(body).forEach((key) => {
        data.append(key, body[key]);
    });

    console.log(data)
    return data;
};
class CheckoutScreen extends Component {

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
            signature: 'Signature',
            upload_signature: '',
            client_latitude: '',
            client_longitude: '',
            note: '',
            upload: '',
            upload_picture: '',
            upload_picture_name: '',
            upload_notes: '',
            isNote: true,
            isUpload: true,
            user_id: '',
            predicted_time_spent: 0,
            datePickerVisible: false,
            timePickerVisible: false,
            error: '',
            client_info: props.navigation.state.params?.client_info,
            selectedOutcome: null,
            outcomes: [],
            customUploadField: {},
            niceDate: '',
            niceTime: ''

        };
        this.getCurrentLocation()
        this.getScheduleItems()
        this.getAllOutcome()
        this.fetchCustomUploadField()
    }

    componentDidMount() {
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

    getScheduleItems() {
        AsyncStorage.multiGet(['user_id', 'notes', 'upload']).then((values) => {
            this.setState({
                ...this.state,
                user_id: values[0][1],
                isNote: values[1][1],
                isUpload: values[2][1]
            })

            let body = {
                user_id: values[0][1]
            }
            fetch(`${SERVER_URL}getCheckoutScheduleByUserId`, {
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
                    let scheduleData = res
                    // console.log(scheduleData)
                    var schedule_items = []
                    let currentDate = new Date()
                    let startDateTime = moment(currentDate).startOf('day');
                    let endDateTime = moment(currentDate).endOf('day');
                    scheduleData.filter(function (fitem) {
                        console.log(moment(fitem.schedule_datetime))
                        return (moment(fitem.schedule_datetime) > startDateTime && moment(fitem.schedule_datetime) < endDateTime);
                    }).map(item => {
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
                    if (schedule_items.length != 0) {
                        this.setState({
                            ...this.state,
                            // schedule_id: schedule_items[0].value,
                            schedule_items: schedule_items
                        })
                    } else {
                        this.setState({
                            ...this.state,
                            // schedule_id: null,
                            schedule_items: []
                        })
                    }


                    return true;
                })
                .catch(error => {
                    return (error)
                })

        })

    }

    getAllOutcome() {
        AsyncStorage.getItem('company_id')
            .then((company_id) => {
                const body = {
                    company_id
                }
                fetch(`${SERVER_URL}getAllOutcome`, {
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
                        this.setState({
                            ...this.state,
                            outcomes: res.data?.filter(item => item.name).map(item => {
                                return {
                                    name: item.name,
                                    id: item.id
                                }
                            }),
                        })
                    })
                    .catch(error => {
                        console.log(error, 'error selectedOutcome')
                    })
            })
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
                this.getCurrentLocation()
                // SimpleToast.show(error)
                // this.setState({
                //     ...this.state,
                //     error: error
                // })
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 3000 },
        );
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

    updateLoadingStatus = bool => {
        this.setState({ isLoading: bool });
    }

    checkout = async () => {
        if (this.state.schedule_id === 0) {
            this.setState({ error: 'No schedule' });
            SimpleToast.show("No schedule.");
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
                    this.calculatePreciseDistance()
                    return true;
                })
                .catch(error => {
                    return (error)
                })
            //this.processCheckout();
        }
    }

    showSignature = () => {
        //getClientInfo by name

        this.setState({
            ...this.state,
            isSignature: true,
        });

    }

    async fetchCustomUploadField() {
        const user = await AsyncStorage.getItem('user')
        const parsedUser = JSON.parse(user);
        const customUploadField = await customFormService.getCustomUploadField(parsedUser.company_id, 'check_out')
        this.setState({
            ...this.state,
            customUploadField
        })
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
            this.processCheckout();
        }
    };

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
                    });
            }
        })
    }

    selectPhotoOld = async () => {
        const permissionGranted = await requestCameraPermission();
        if (!permissionGranted) {
            return
        }
        var options = {
            title: 'Select Image',
            storageOptions: {
                skipBackup: true,
                path: 'images'
            }
        };
        launchCamera(options, (response) => {
            console.log('Response = ', response);
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorMessage) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else {
                console.log('User selected a file form camera or gallery', response.assets[0].uri);
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
                    .catch((err) => { console.log(err) });
            }
        })
    }

    processCheckout = async () => {
        if (this.state.customUploadField.enable && this.state.customUploadField.required) {
            if (!this.state.upload_picture) {
                SimpleToast.show("Upload image is Required")
                return null
            }
        }
        //Check if it is in 3000m

        // console.log(this.state.schedule_id, this.state.date + " " + this.state.time)
        if (!this.state.selectedOutcome?.id) {
            SimpleToast.show("Outcome cannot be empty")
            return null
        }
        let body = {
            schedule_id: this.state.client_info.schedule_id,
            check_out_datetime: this.state.date + " " + this.state.time,
            upload_picture: this.state.upload_picture,
            notes: this.state.upload_notes,
            signature: this.state.upload_signature,
            outcome_id: this.state.selectedOutcome.id
        }
        fetch(`${SERVER_URL}checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
            .then(res => {
                console.log("Sadfasdfasdfads=> ", res)
                return res.json()
            })
            .then(res => {
                if (res.error) {
                    throw (res.error);
                }
                console.log("Checkout response === > ", res)
                SimpleToast.show("Checkout Success!")

                this.setState({
                    upload_notes: '',
                    upload_picture: '',
                    schedule_id: 0,
                    schedule_items: [],
                })
                this.componentDidMount()
                this.props.navigation.navigate("Home");
                return true;
            })
            .catch(error => {
                console.log(error, 'error checkout')
                return (error)
            })

    }

    saveSign() {
        this.refs["sign"].saveImage();
    }

    resetSign() {
        this.refs["sign"].resetImage();
    }

    handleSelectOutcome = (selectedItem, index) => {
        this.setState({
            ...this.state,
            selectedOutcome: selectedItem,
        })
    }

    _onSaveEvent(result) {
        //result.encoded - for the base64 encoded png
        //result.pathName - for the file path name
        // let that = this;
        console.log(result);
        fetch(`${SERVER_URL}signature`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                uri: result.encoded,
                type: 'image/png',
                name: 'signature.png'
            })
        }).then((res) => {
            console.log(res);
            return res.json()
        })
        .then(res => {
            console.log(res.name);
            this.setState({
                upload_signature: res.name
            })
            SimpleToast.show("Signature uploaded successfully")
            return true
        }).catch(error => {
            console.warn(error);
        });

    }
    _onDragEvent() {
        // This callback will be called when the user enters signature
        console.log("dragged");
    }

    render() {

        console.log(this.state.outcomes)

        return (
            <View style={styles.container} >
                {/* <StatusBarPlaceHolder /> */}
                < KeyboardAwareScrollView contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', alwaysBounceVertical: true }}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag" >
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
                            <Text style={{ fontWeight: 'bold', fontSize: 30, marginBottom: 5, alignSelf: 'center' }}>Check Out</Text>
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
                        <ScrollView>
                            <>
                                {/*<View style={styles.inputContainer}>
                                    <Image style={styles.inputIcon} source={require('../../assets/ic_home_64dp.png')} />
                                    <TextInput style={styles.time} editable={false}>{this.state.client_info.client_entity_name}</TextInput>
                                     <Picker
                                        style={styles.inputBox}
                                        placeholder="Checkout"
                                        selectedValue={this.state.schedule_id}
                                        onValueChange={(value) => {
                                            console.log(value)
                                            let schedule_item = this.state.schedule_items.filter((item) => {
                                                return item.value == value
                                            })
                                            this.setState({
                                                schedule_id: value,
                                                client_id: schedule_item.length != 0 ? schedule_item[0].client_id : 0
                                            })
                                        }
                                        } >
                                        {
                                            this.state.schedule_items.map((item, index) => {
                                                return (
                                                    <Picker.Item key={index} label={item.label} value={item.value} />
                                                )
                                            })
                                        }
                                    </Picker> 
                                </View>*/}
                                <View>
                                    <SelectDropdown
                                        buttonStyle={styles.inputContainer}
                                        buttonTextStyle={styles.inputDropdown}
                                        data={this.state.outcomes}
                                        onSelect={this.handleSelectOutcome}
                                        defaultButtonText="Pilih Hasil Kunjungan"
                                        buttonTextAfterSelection={(selectedItem, index) => {
                                            // text represented after item is selected
                                            // if data array is an array of objects then return selectedItem.property to render after item is selected
                                            return selectedItem.name
                                        }}
                                        rowTextForSelection={(item, index) => {
                                            // text represented for each item in dropdown
                                            // if data array is an array of objects then return item.property to represent item in dropdown
                                            return item.name
                                        }}
                                        renderDropdownIcon={() => {
                                            // You can use any icon library or custom icon component here
                                            return <FontAwesome name={'caret-down'} color={'#444'} size={18} />;
                                        }}
                                        search
                                        searchPlaceHolder={'Type here'}
                                        renderSearchInputLeftIcon={() => {
                                            return <FontAwesome name={'search'} color={'#444'} size={18} />;
                                        }}
                                    />
                                </View>
                                
                                <View>
                                    {
                                        this.state.isNote == true && <View style={styles.inputNote}>
                                            <TextInput
                                                style={styles.note}
                                                multiline={true}
                                                placeholder={'NOTE'}
                                                onChangeText={value => this.setState({ error: '', upload_notes: value })}
                                            >{this.state.note}</TextInput>
                                        </View>
                                    }
                                    {
                                        this.state.isUpload == true && this.state.customUploadField.enable && <View>
                                            <Text style={{ alignSelf: 'center', fontSize: 15 }}>UPLOAD</Text>
                                            <TouchableOpacity style={styles.cameraButton} onPress={this.selectPhoto}>
                                                <Image style={styles.backButtonIcon} source={require('../../assets/camera.png')} />
                                            </TouchableOpacity>
                                            <Text style={{ alignSelf: 'center', fontSize: 12, marginBottom: 20 }}>{ ((this.state.upload_picture_name).length > 10) ? 
                                                ('...' + ((this.state.upload_picture_name).substring(this.state.upload_picture_name.length - 10, this.state.upload_picture_name.length))) : 
                                                this.state.upload_picture_name }
                                            </Text>
                                        </View>
                                    }

                                </View>
                                <View style={{ borderColor: 'red', borderWidth: 1 }}>
                                    <SignatureCapture
                                        style={{
                                            borderColor: 'black',
                                            borderWidth: 0.5,
                                            width: "90%",
                                            height: 100
                                        }}
                                        ref="sign"
                                        maxStrokeWidth={1}
                                        onSaveEvent={this._onSaveEvent.bind(this)}
                                        onDragEvent={this._onDragEvent}
                                        saveImageFileInExtStorage={false}
                                        showNativeButtons={false}
                                        showTitleLabel={false}
                                        viewMode={"portrait"} />
                                </View>
                                <View style={{ flex: 1, flexDirection: "row" }}>
                                    <TouchableHighlight style={styles.buttonStyle}
                                        onPress={() => { this.saveSign() }} >
                                        <Text>Save</Text>
                                    </TouchableHighlight>

                                    <TouchableHighlight style={styles.buttonStyle}
                                        onPress={() => { this.resetSign() }} >
                                        <Text>Reset</Text>
                                    </TouchableHighlight>

                                </View>

                                <TouchableOpacity
                                    style={styles.buttonContainer}
                                    onPress={this.checkout}>
                                    <Text style={AppStyles.text}>CHECK OUT</Text>
                                </TouchableOpacity>

                            </>

                        </ScrollView>

                    </View>

                </KeyboardAwareScrollView >

                <Modal transparent={true} visible={this.state.isLoading} animationType='fade'
                    onRequestClose={() => this.updateLoadingStatus(false)}>
                    <WaitingDialog />
                </Modal>
            </View >
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

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutScreen);