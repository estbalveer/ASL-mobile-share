import React, { Component } from 'react';
import { connect } from "react-redux";
import { View, BackHandler, Modal, ImageBackground, TouchableOpacity, Image, Text, TextInput, Alert } from 'react-native';
import styles from './style'
import WaitingDialog from "../../components/waitingDialog";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scrollview";
import ShakingText from 'react-native-shaking-text';
import { AppStyles } from "../../styles/styles";
import AsyncStorage from '@react-native-community/async-storage';
import { GOOGLE_MAP_API_KEY, SERVER_URL } from "../../common/config";
import SimpleToast from "react-native-simple-toast";
import RNModal from 'react-native-modal';
import LocationView from "react-native-location-view";
import Geolocation from 'react-native-geolocation-service';
import { Spinner } from 'native-base';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

navigator.geolocation = require('@react-native-community/geolocation');

class CreateClientScreen extends Component {

    constructor(props) {
        super();
        this.state = {
            isLoading: false,
            client_entity_name: '',
            address: '',
            latitude: '',
            longitude: '',
            phone_number: '',
            company_id: '',
            custom_field: '',
            created_by: '',
            error: '',
            showModalMaps: false,
            currentLatitude: 0,
            currentLongitude: 0,
            loadingCurrentLocation: true
        };
        this.locationInputRef = React.createRef()
    }

    componentDidMount() {
        this.getCurrentLocation()
        const { navigation } = this.props;
        navigation.addListener('willFocus', async () => {
            BackHandler.addEventListener('hardwareBackPress', () => this.onBackButtonClicked());
        });
        navigation.addListener('willBlur', () => {
            BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonClicked);
        });

        this.getLocalStorage()
    }

    componentDidUpdate(_, prevState) {
        if (prevState.showModalMaps !== this.state.showModalMaps) {
            if (this.state.showModalMaps === true) {
                this.locationInputRef?.current?.focus?.()
            } else {
                this.locationInputRef?.current?.blur?.()
            }
        }
    }

    getLocalStorage() {
        AsyncStorage.multiGet(['user_id', 'company_id']).then((values) => {
            this.setState({
                ...this.state,
                created_by: values[0][1],
                company_id: values[1][1],
            })
        })
    }

    onBackButtonClicked = () => {
        this.props.navigation.navigate("Home");
        return true;
    }

    updateLoadingStatus = bool => {
        this.setState({ isLoading: bool });
    }

    getCurrentLocation() {
        this.setState({
            loadingCurrentLocation: true
        })
        Geolocation.getCurrentPosition(
            //Will give you the current location
            (position) => {
                console.log(position, 'positionnnnnnnnnnnnnnnnnnnnnnnnnn')
                // setLocationStatus('You are Here');

                //getting the Longitude from the location json
                const currentLongitude = position.coords.longitude;

                //getting the Latitude from the location json
                const currentLatitude = position.coords.latitude;

                console.log(currentLatitude, currentLongitude)

                this.setState({
                    ...this.state,
                    currentLatitude:currentLatitude,
                    currentLongitude:currentLongitude,
                    loadingCurrentLocation: false
                })
            },
            (error) => {
                console.log(error, 'errorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr')
                this.getCurrentLocation()
                // SimpleToast.show(error.message)
                // this.setState({
                //     ...this.state,
                //     error: error.message,
                //     showModalMaps: false
                // })
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 3000 },
        );
    }

    create_client = async () => {

        if (this.state.client_entity_name == null || this.state.client_entity_name == "") {
            SimpleToast.show("Please enter client entity name.")
            return
        } else if (this.state.address == null || this.state.address == "") {
            SimpleToast.show("Please enter client address.")
            return
        } else if (this.state.latitude == null || this.state.latitude == "") {
            SimpleToast.show("Please enter latitude.")
            return
        } else if (this.state.longitude == null || this.state.longitude == "") {
            SimpleToast.show("Please enter longitude.")
            return
        } else if (this.state.phone_number.length == 0 || this.state.phone_number.length < 7) {
            SimpleToast.show('Please enter valid phone number')
            return
        } else {
            console.log("create_client")
            let body = {
                client_entity_name: this.state.client_entity_name,
                address: this.state.address,
                location: this.state.latitude + ' ' + this.state.longitude,
                custom_field: this.state.custom_field ?? 'N/A',
                phone_number: this.state.phone_number,
                company_id: this.state.company_id,
                approved: '0',
                created_by: this.state.created_by
            }
            fetch(`${SERVER_URL}addClient`, {
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
                    console.log(res)
                    if (res.client_id != null) {
                        SimpleToast.show('This client is already exist.')
                    } else {
                        SimpleToast.show("Create Success!")
                    }
                    this.setState({
                        ...this.state,
                        isLoading: false,
                        client_entity_name: '',
                        address: '',
                        latitude: '',
                        longitude: '',
                        phone_number: '',
                        custom_field: '',
                        error: '',
                    });
                    this.props.navigation.navigate("Home");
                    return true;
                })
                .catch(error => {
                    return (error)
                })

        }

    }

    
    render() {
        console.log(this.state)
        return (
            <View style={styles.container}>
                {/* <StatusBarPlaceHolder /> */}
                <View style={{flex: 1}}>
                <RNModal
                    isVisible={this.state.showModalMaps}
                    onBackdropPress={() => this.setState({ showModalMaps: false })}
                    onBackButtonPress={() => this.setState({ showModalMaps: false })}
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
                    {
                        this.state.loadingCurrentLocation
                        ?
                        <Spinner color="#5589e6" />
                        :
                        <GooglePlacesAutocomplete
                            ref={this.locationInputRef}
                            placeholder='Search Address'
                            currentLocation={true}
                            currentLocationLabel="Current Location"
                            onPress={(data, details = null) => {
                                this.setState({
                                    address: data.description || data.name,
                                    latitude: details.geometry.location.lat,
                                    longitude: details.geometry.location.lng,
                                    showModalMaps: false
                                })
                            }}
                            query={{
                                key: GOOGLE_MAP_API_KEY,
                                language: 'en',
                            }}
                            GooglePlacesDetailsQuery={{
                                fields: 'geometry'
                            }}
                            fetchDetails={true}
                        />
                    }
                </RNModal>
            </View>
                <KeyboardAwareScrollView contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', alwaysBounceVertical: true }}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag">
                    <View style={styles.avatarContainer}>
                        <View style={{ position: 'absolute', left: 0 }}>
                            <TouchableOpacity style={styles.backButton} onPress={() => this.onBackButtonClicked()}>
                                <Image style={styles.backButtonIcon} source={require('../../assets/arrow_back.png')} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ height: '100%', width: '100%', alignItems: 'center', margin: 5, alignSelf: 'center', }}>
                            <View>
                                <Image source={require('../../assets/logo-login.png')} style={styles.image} />
                            </View>
                        </View>
                    </View>
                    <View style={styles.loginContainer}>
                        <ShakingText style={styles.error}>{this.state.error}</ShakingText>
                        <View>
                            <Text style={{ fontWeight: 'bold', fontSize: 30, marginBottom: 10 }}>New Client</Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <Image style={styles.inputIcon} source={require('../../assets/ic_user_64dp.png')} />
                            <TextInput
                                style={styles.time}
                                editable={true}
                                placeholder={'Client Name'}
                                onChangeText={value => this.setState({ error: '', client_entity_name: value })}
                            >{this.state.client_entity_name}
                            </TextInput>
                        </View>
                        <TouchableOpacity onPress={() => this.setState({showModalMaps: true}) }>
                            <View style={styles.inputContainer}>
                                <Image style={styles.inputIcon} source={require('../../assets/maps_location.png')} />
                                <TextInput
                                    style={styles.time}
                                    editable={false}
                                    placeholder={'Address'}
                                    >
                                        {
                                        this.state.address
                                            ?
                                            this.state.address
                                            :
                                            "Select Address"
                                        }
                                </TextInput>
                                {/* <Text style={styles.time}>
                                    {
                                        this.state.address
                                            ?
                                            this.state.address
                                            :
                                            "Select Address"
                                    }
                                </Text> */}
                            </View>
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', }}>
                            <View style={styles.inputLatLong}>
                                <TextInput
                                    style={styles.inputLatLongBox}
                                    editable={false}
                                    placeholder="Latitude"
                                    // keyboardType='numeric'
                                    onChangeText={value => this.setState({ error: '', latitude: value })}>
                                {
                                        this.state.latitude
                                            ?
                                            this.state.latitude
                                            :
                                            null
                                        }
                                </TextInput>
                            </View>
                            <View style={styles.inputLatLong}>
                                <TextInput
                                    style={styles.inputLatLongBox}
                                    editable={false}
                                    placeholder="Longitude"
                                    // keyboardType='numeric'
                                    onChangeText={value => this.setState({ error: '', longitude: value })}>
                                {
                                        this.state.longitude
                                            ?
                                            this.state.longitude
                                            :
                                            null
                                        }
                                </TextInput>
                            </View>
                        </View>
                        <View style={styles.inputContainer}>
                            <Image style={styles.inputIcon} source={require('../../assets/mobile.png')} />
                            <TextInput
                                style={styles.time}
                                editable={true}
                                placeholder={'Phone Number'}
                                keyboardType='numeric'
                                onChangeText={value => this.setState({ error: '', phone_number: value })}
                            >{this.state.phone_number}
                            </TextInput>
                        </View>
                        <View style={styles.inputContainer}>
                            <Image style={styles.inputIcon} source={require('../../assets/ic_aboutus_64dp.png')} />
                            <TextInput
                                style={styles.time}
                                editable={true}
                                placeholder={'Custom Field'}
                                onChangeText={value => this.setState({ error: '', custom_field: value })}
                            >{this.state.custom_field}
                            </TextInput>
                        </View>

                        <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={this.create_client}>
                            <Text style={AppStyles.text}>CREATE CLIENT</Text>
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateClientScreen);