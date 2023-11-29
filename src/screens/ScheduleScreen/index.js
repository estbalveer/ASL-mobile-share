import React, { Component } from 'react';
import { connect } from "react-redux";
import { View, BackHandler, Modal, ImageBackground, TouchableOpacity, Image, Text, TextInput, Alert, FlatList } from 'react-native';
import styles from "./style";
import StatusBarPlaceHolder from "../../components/statusbarPlaceHolder";
import WaitingDialog from "../../components/waitingDialog";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scrollview";
import ShakingText from 'react-native-shaking-text';
import { AppStyles } from "../../styles/styles";
// import DatePicker from 'react-native-date-picker'
import moment from 'moment';
import { scheduleActions } from '../../redux/actions/ScheduleAction'
import { SERVER_URL } from "../../common/config";
import SelectDropdown from 'react-native-select-dropdown'
import SectionedMultiSelect from 'react-native-sectioned-multi-select';

// import * as userActions from "../../redux/actions/userActions";
import { bindActionCreators } from "redux";
import { H1, Item } from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';
import SimpleToast from 'react-native-simple-toast';
import { SearchBar, ListItem } from 'react-native-elements';
import RNModal from 'react-native-modal';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

class SchduleScreen extends Component {

    constructor(props) {
        super();
        this.state = {
            selectedClient: {},
            valueClient: '',
            showModalClients: false,
            isLoading: false,
            company_items: [],
            user_id: '',
            company_code: 0,
            date: null,
            time: null,
            rawTime: null,
            rawDate: null,
            predicted_time_spent: 0,
            datePickerVisible: false,
            timePickerVisible: false,
            min_time: new Date(),
            max_time: new Date(),
            error: '',

            selected_reason: {},
            selected_product: [],
            upload_reason: 'Create Sales Order',
            isOtherReason: false,
            visiting_reason: [],
            products: [],
            isVisitingReasonLoading: false,
            isProductDropdownOpen: false
        };
        this.arrayholder = [];
    }

    componentDidMount() {
        const { navigation } = this.props;
        navigation.addListener('willFocus', async () => {
            BackHandler.addEventListener('hardwareBackPress', () => this.onBackButtonClicked());
        });
        navigation.addListener('willBlur', () => {
            BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonClicked);
        });
        setTimeout(() => {
            AsyncStorage.multiGet(['user_id', 'min_time', 'max_time', 'company_id']).then((value) => {
                console.log("async===>", value)
                let min_time = new Date(moment().add(value[1][1] / 1440, 'days'))
                let max_time = new Date(moment().add(value[2][1] / 1440, 'days'))
                let company_id = value[3][1]
                console.log('min, max time===>', min_time, max_time)
                this.setState({
                    ...this.state,
                    user_id: value[0][1],
                    min_time: min_time,
                    max_time: max_time
                })
                let clientBody = {
                    user_id: value[0][1]
                }
                fetch(`${SERVER_URL}getClientsById`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(clientBody)
                })
                    .then(res => {
                        return res.json()
                    })
                    .then(res => {
                        console.log(res, 'ressssssssssszzzzzzzzzzzzz')
                        if (res.error) {
                            throw (res.error);
                        }
                        this.setState({
                            ...this.state,
                            company_items: res,
                            company_code: res[0].client_id

                        })
                        this.arrayholder = res;
                    })
                    .catch(error => {
                        return (error)
                    })

                let visitingReasonBody = {
                    company_id
                }
                this.setState({
                    ...this.state,
                    isVisitingReasonLoading: true
                })
                fetch(`${SERVER_URL}getAllVisitingReason`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(visitingReasonBody)
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
                            visiting_reason: res.data,
                            isVisitingReasonLoading: false
                        })
                    })
                    .catch(error => {
                        return (error)
                    })
                let productBody = {
                    company_id
                }
                fetch(`${SERVER_URL}getAllProduct`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productBody)
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
                            products: res.data?.filter(item => item.name).map(item => {
                                return {
                                    name: item.name,
                                    id: item.id
                                }
                            }),
                        })
                    })
                    .catch(error => {
                        return (error)
                    })
            })

        }, 1000);
    }

    onBackButtonClicked = () => {
        this.props.navigation.navigate("Home");
        return true;
    }

    updateLoadingStatus = bool => {
        this.setState({ isLoading: bool });
    }


    showDatePicker = () => {
        this.setState({ datePickerVisible: true });
    }

    hideDatePicker = () => {
        this.setState({ datePickerVisible: false });
    }

    handleDatePicker = date => {
        this.setState({
            datePickerVisible: false,
            date: moment(date).format('YYYY-MM-DD'),
            rawDate: date,
            error: ''
        });
    }

    showTimePicker = () => {
        this.setState({ timePickerVisible: true });
    }

    hideTimePicker = () => {
        this.setState({ timePickerVisible: false });
    }

    handleTimePicker = time => {
        console.log(time, 'timeeeeeeeeeeeeee')
        this.setState({
            timePickerVisible: false,
            rawTime: time,
            time: moment(time).format('HH:mm:ss'),
            error: ''
        });
    }

    schedule = () => {
        let compareDate = moment(this.state.date + " " + this.state.time)
        console.log("compare Date===>", compareDate)
        if (this.state.company_code === 0) {
            this.setState({ error: 'Select Company' });
        } else if (this.state.date === '' || this.state.date == 'Pilih Tanggal') {
            this.setState({ error: 'Pilih Tanggal' });
        } else if (this.state.time === '' || this.state.time == 'Pilih Waktu') {
            this.setState({ error: 'Pilih Waktu' } );
        } else if (this.state.predicted_time_spent === '') {
            this.setState({ error: 'Enter predicted time spent' });
        } else if (this.state.min_time > compareDate || this.state.max_time < compareDate) {
            this.setState({ error: 'Selected time is out of company rule.' })
        } else if (this.state.selected_reason?.id === undefined) {
            this.setState({ error: 'Pilih Alasan Kunjungan' })
        } else if (this.state.selected_reason?.include_product > 0 && !this.state.selected_product?.length) {
            this.setState({ error: 'Select Product' })
        }
        else {
            this.processSchedule();
        }
    }

    processSchedule = async () => {
        let body = {
            user_id: this.state.user_id,
            client_id: this.state.company_code,
            schedule_datetime: this.state.date + " " + this.state.time,
            predicted_time_spent: this.state.predicted_time_spent.toString(),
            reason: this.state.selected_reason.id,
            products: this.state.selected_product || []
        }
        // this.props.addSchedule(body)
        fetch(`${SERVER_URL}createNewSchedule`, {
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
                if (res.schedule_id == "0") {
                    SimpleToast.show("This time frame is already scheduled.")
                } else {
                    SimpleToast.show("Successfully scheduled.")
                    this.props.navigation.navigate("Home");
                }

                return true;
            })
            .catch(error => {
                return (error)
            })

    }

    renderSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    width: '100%',
                    backgroundColor: '#CED0CE',
                }}
            />
        );
    };

    searchFilterFunction = text => {
        this.setState({
            valueClient: text,
        });

        const newData = this.arrayholder.filter(item => {
            const itemData = `${item.client_entity_name?.toLowerCase()}`;
            // const textData = text.toUpperCase();

            return itemData.indexOf(text.toLowerCase()) > -1;
        });
        this.setState({
            company_items: newData,
        });
    };

    onItemClicked = (item) => {
        //getClientInfo by name
        this.setState({ showModalClients: false });
        console.log(item, "itemmmm")
        this.setState({ selectedClient: item, company_code: item.client_id })
        return true;
    }

    handleSelectVisitingReason = (selectedItem, index) => {
        this.setState({
            ...this.state,
            selected_reason: selectedItem,
            isVisitingReasonLoading: true
        })
    }

    handleSetProductValue = (selected_product) => {
        this.setState(state => ({
            selected_product
        }));
    }

    render() {
        return (
            <View style={styles.container}>
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
                            <Text style={{ fontWeight: 'bold', fontSize: 30, marginBottom: 15 }}>Buat Jadwal</Text>
                        </View>

                        <TouchableOpacity onPress={() => this.setState({ showModalClients: true })}>
                            <View style={styles.inputContainer} >
                                <Image style={styles.inputIcon} source={require('../../assets/ic_home_64dp.png')} />
                                <Text style={styles.time}>{this.state.selectedClient.client_entity_name ? this.state.selectedClient.client_entity_name : 'Pilih Klien'}</Text>
                            </View>
                        </TouchableOpacity>
                        <RNModal
                            onBackButtonPress={() => this.setState({ showModalClients: false })}
                            isVisible={this.state.showModalClients}
                            onBackdropPress={() => this.setState({ showModalClients: false })}
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
                            <SearchBar
                                placeholder="Type Here..."
                                lightTheme
                                round
                                onChangeText={text => this.searchFilterFunction(text)}
                                autoCorrect={true}
                                value={this.state.valueClient}
                            />
                            <FlatList
                                data={this.state.company_items}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => { this.onItemClicked(item) }}
                                    >
                                        <ListItem>
                                            <ListItem.Content>
                                                <ListItem.Title>
                                                    {`${item.client_entity_name}`}
                                                </ListItem.Title>
                                            </ListItem.Content>
                                        </ListItem>
                                        {/* <Image source={require('../../assets/right-arrow.png')} style={styles.listImage} /> */}
                                    </TouchableOpacity>
                                )}
                                keyExtractor={item => item.email}
                                ItemSeparatorComponent={this.renderSeparator}
                            // ListHeaderComponent={this.renderHeader}
                            />
                        </RNModal>
                        {/* <View style={styles.inputContainer}>
                            <Image style={styles.inputIcon} source={require('../../assets/ic_home_64dp.png')} />
                            <Picker
                                style={styles.inputBox}
                                placeholder="Company Name"
                                selectedValue={this.state.company_code}
                                onValueChange={(value) => {
                                    console.log(value)
                                    this.setState({ company_code: value })
                                    console.log(this.state.company_code)
                                }
                                } >
                                {
                                    this.state.company_items.map((item, index) => {
                                        return (
                                            <Picker.Item key={index} label={item.client_entity_name} value={item.client_id} />
                                        )
                                    })
                                }
                            </Picker>
                        </View> */}
                        <TouchableOpacity style={styles.inputContainer} onPress={this.showDatePicker}>
                            <Image style={styles.inputIcon} source={require('../../assets/calendar.png')} />
                            <Text style={styles.time}>{this.state.date || 'Pilih Tanggal'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.inputContainer} onPress={this.showTimePicker}>
                            <Image style={styles.inputIcon} source={require('../../assets/clock.png')} />
                            <Text style={styles.time}>{this.state.time || 'Pilih Waktu'}</Text>
                        </TouchableOpacity>
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
                                    return selectedItem.name
                                }}
                                rowTextForSelection={(item, index) => {
                                    // text represented for each item in dropdown
                                    // if data array is an array of objects then return item.property to represent item in dropdown
                                    return item.name
                                }}
                                renderDropdownIcon={() => {
                                    // You can use any icon library or custom icon component here
                                    return (
                                        <View style={{ paddingLeft: 10 }}>
                                            <FontAwesome name={'caret-down'} color={'#444'} size={18} />
                                        </View>
                                    );
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
                            this.state.selected_reason?.include_product ? (
                                <SectionedMultiSelect
                                    single={false}
                                    styles={{
                                        selectToggle: styles.inputContainer,
                                        selectToggleText: {
                                            paddingHorizontal: 20,
                                            paddingVertical: 10
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
                            ) : null
                        }
                        </View>
                        <View>
                            {
                                this.state.isOtherReason && <View style={styles.inputReason}>
                                    <TextInput
                                        style={styles.note}
                                        multiline={true}
                                        placeholder={'REASON'}
                                        onChangeText={value => this.setState({ error: '', upload_reason: value })}
                                    >{this.state.upload_reason}</TextInput>
                                </View>
                            }

                        </View>
                        <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={this.schedule}>
                            <Text style={AppStyles.text}>SCHEDULE</Text>
                        </TouchableOpacity>
                        {/* <DatePicker
                            modal
                            mode='date'
                            androidVariant='iosClone'
                            date={this.state.rawDate || new Date()}
                            open={this.state.datePickerVisible}
                            minimumDate={this.state.min_time}
                            maximumDate={this.state.max_time}
                            onConfirm={this.handleDatePicker}
                            onCancel={this.hideDatePicker}
                        /> */}
                        {/* <DatePicker
                            modal
                            mode='time'
                            androidVariant='iosClone'
                            date={this.state.rawTime || new Date()}
                            open={this.state.timePickerVisible}
                            onConfirm={this.handleTimePicker}
                            onCancel={this.hideTimePicker}
                        /> */}
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

const mapStateToProps = state => ({
    add_schedule: state.add_schedule,
    // client_info: state.client_info
})

const mapDispatchToProps = dispatch => bindActionCreators({
    addSchedule: scheduleActions.addSchedule,

}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(SchduleScreen);