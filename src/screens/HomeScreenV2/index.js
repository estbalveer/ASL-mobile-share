import React, { Component } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Button,
  Platform,
  Image,
  PermissionsAndroid,
  NativeEventEmitter,
  NativeModules,
  ToastAndroid,
  Dimensions,
  StyleSheet,
  RefreshControl,
  Linking
} from 'react-native';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import { CardViewWithImage } from 'react-native-simple-card-view'
import { screenWidth } from '../../styles/mixins';
import styles from "./style";
import Modal from 'react-native-modal';
import Drawer from 'react-native-drawer';
import { scheduleActions } from '../../redux/actions/ScheduleAction';
import { userActions } from '../../redux/actions/AuthAction'
import { clientActions } from '../../redux/actions/ClientAction'
import { SERVER_URL } from "../../common/config";
import { mapValues } from 'lodash';
import moment from 'moment'
import 'moment/locale/id'
import openMap from 'react-native-open-maps';
// import ReactNativeAN from 'react-native-alarm-notification';
import { Card } from 'react-native-elements'
import { Calendar, LocaleConfig } from 'react-native-calendars';
import AntDesign from 'react-native-vector-icons/AntDesign'
import { Spinner } from 'native-base';
import { setUser } from '../../redux/actions/UserAction';
import axios from 'axios';
import BadgeStatus from '../../components/BadgeStatus';

moment.locale('id')

LocaleConfig.locales['id'] = {
  monthNames: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  monthNamesShort: ['Jan.','Feb.','Mar','Apr','Mei','Jun','Jul.','Agus','Sep.','Okt.','Nov.','Des.'],
  dayNames: ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'],
  dayNamesShort: ['M','S','S','R.','K','J','S'],
  today: 'Hari\'ini',
};
LocaleConfig.defaultLocale = 'id';

// const { RNAlarmNotification } = NativeModules;
// const RNEmitter = new NativeEventEmitter(RNAlarmNotification);

// const alarmNotifData = {
//   title: 'Scouthippo Notification',
//   message: 'Please check schedule.',
//   vibrate: true,
//   play_sound: true,
//   schedule_type: 'once',
//   channel: 'Require Notification',
//   data: { content: 'Schedule Notification' },
//   loop_sound: true,
//   has_button: true,
//   small_icon: "ic_launcher",
//   large_icon: "ic_launcher",
//   snooze_interval: 5,
// };
// const tableData = []
const getInitialDate = () => moment().format('YYYY-MM-DD');
class Home extends Component {

  _subscribeOpen;
  _subscribeDismiss;

  constructor(props) {
    super();
    this.closeControlPanel = this.closeControlPanel.bind(this);
    this.openControlPanel = this.openControlPanel.bind(this);
    this.state = {
      showModal: false,
      selectedItem: {},
      client_info: {
        client_entity_name: "Amazon",
        custom_field: "Jack",
        address: "1 Carlton St. NSW. Sydney",
        latitude: '',
        longitude: ''
      },
      full_name: 'User Name',
      user_id: '',
      company_id: '',
      schedules: [],
      tableData: [],
      scheduleListData: [],
      update: [],
      futureFireDate: '1',
      alarmId: null,
      datePickerVisible: false,
      date: moment(new Date()).format('ddd, Do MMM YYYY'),
      error: '',
      selectedDate: getInitialDate(),
      isLoadingModal: false,
      refreshing: false,
      absent: {
        isLoading: false,
        isCheckIn: null,
        isCheckOut: null,
        absentFeature: false
      },
      canvas_checkin_feature: false
    };
  }

  // componentDidMount() {
  //   // this.getAbsent()
  //   this.getCompanyCanvasCheckinFeature()
  //   this._subscribeDismiss = RNEmitter.addListener(
  //     'OnNotificationDismissed',
  //     (data) => {
  //       const obj = JSON.parse(data);
  //       console.log(`notification id: ${obj.id} dismissed`);
  //     },
  //   );

  //   this._subscribeOpen = RNEmitter.addListener(
  //     'OnNotificationOpened',
  //     (data) => {
  //       console.log(data);
  //       const obj = JSON.parse(data);
  //       console.log(`app opened by notification: ${obj.id}`);
  //     },
  //   );

  //   // check ios permissions
  //   if (Platform.OS === 'ios') {
  //     this.showPermissions();

  //     ReactNativeAN.requestPermissions({
  //       alert: true,
  //       badge: true,
  //       sound: true,
  //     }).then(
  //       (data) => {
  //         console.log('RnAlarmNotification.requestPermissions', data);
  //       },
  //       (data) => {
  //         console.log('RnAlarmNotification.requestPermissions failed', data);
  //       },
  //     );
  //   }

  //   this.getSchedule()
  // }

  // componentWillUnmount() {
  //   this._subscribeDismiss.remove();
  //   this._subscribeOpen.remove();
  // }

  onDayPress = day => {
    console.log("day")
    this.setState({
      selectedDate: day.dateString,
      datePickerVisible: false
    }, () => this.setTableData(new Date(day.dateString)));
  };

  // setAlarm = async (fireDate) => {
  //   const { update } = this.state;

  //   const details = { ...alarmNotifData, fire_date: fireDate };
  //   console.log(`alarm set: ${fireDate}`);

  //   try {
  //     const alarm = await ReactNativeAN.scheduleAlarm(details);
  //     console.log(alarm);
  //     if (alarm) {
  //       this.setState({
  //         update: [...update, { date: `alarm set: ${fireDate}`, id: alarm.id }],
  //       });
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

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
        user_id,
        company_id,
        date: moment(new Date()).format('YYYY-MM-DD')
      })
      console.log(response?.data, 'absenttttt')
      this.setState({
        absent: {
          ...this.state.absent,
          isCheckIn: !!response?.data?.payload?.check_in_datetime,
          isCheckOut: !!response?.data?.payload?.check_out_datetime,
          absentFeature: response?.data?.payload?.absent_feature
        }
      })
      return response?.data
    } catch (error) {
      if (error?.response?.status === 404) {
        this.setState({
          absent: {
            ...this.state.absent,
            isCheckIn: false,
            isCheckOut: false,
            absentFeature: false
          }
        })
      }
    } finally {
      this.setState({
        absent: {
          ...this.state.absent,
          isLoading: false
        }
      })
    }
  }

  handleAbsent = () => {
    this.props.navigation.navigate('Absent')
  }

  // checkAlarms = async () => {
  //   console.log("")
  //   const list = await ReactNativeAN.getScheduledAlarms();
  //   console.log(list.length)
  //   if (list.length == 0) {
  //     this.state.scheduleListData.map(item => {
  //       this.setAlarm(item.format('DD-MM-YYYY HH:mm:ss'))
  //     })
  //   } else {
  //     var items = []
  //     // this.state.scheduleListData.map(item => {
  //     list.map(l => {
  //       let date = moment();
  //       date.year(l.year);
  //       date.month(l.month - 1)
  //       date.date(l.day)
  //       date.hour(l.hour)
  //       date.minute(l.minute)
  //       date.second(l.second)
  //       // let a_date = l.year.toString() + "-" + l.month.toString() + '-' + l.day.toString() + ' ' + l.hour.toString() + ':' + l.minute.toString() + ':' + l.second.toString()
  //       let l_date = date.format('YYYY-MM-DD HH:mm:ss')
  //       items.push(l_date)

  //     })
  //     // })
  //     console.log(items)
  //     this.state.scheduleListData.map(s_item => {
  //       console.log("s_item: ", s_item)
  //       if (!items.includes(s_item.format('YYYY-MM-DD HH:mm:ss'))) {
  //         this.setAlarm(moment(s_item).format('DD-MM-YYYY HH:mm:ss'))
  //       }
  //     })

  //   }

  //   const update = list.map((l) => ({
  //     date: `alarm: ${l.day}-${l.month}-${l.year} ${l.hour}:${l.minute}:${l.second}`,
  //     id: l.id,
  //   }));

  //   this.setState({ update });

  // };

  getSchedule(callback) {
    AsyncStorage.multiGet(['user_id', 'full_name', 'company_id']).then((values) => {
      console.log("get full name===>", values[1][1])

      this.setState({
        ...this.state,
        user_id: values[0][1],
        full_name: values[1][1],
        company_id: values[2][1]
      })
      console.log(values)
      console.log("getcompany", values[2][1])
      this.getCompanyRule(values[2][1])
      // this.props.getSchedule(this.state.user_id)
      let body = {
        user_id: values[0][1]
      }
      fetch(`${SERVER_URL}getScheduleByUserId`, {
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
          this.setState({
            ...this.state,
            schedules: scheduleData,
          })
          let currentDate = new Date()
          this.setTableData(currentDate)

          //Get Scheduled alarm items
          // this.checkAlarms()

          return true;
        })
        .catch(error => {
          return (error)
        })
        .finally(() => {
          callback?.()
        })
    })
  }

  async getCompanyCanvasCheckinFeature() {
    try {
      const company_id = await AsyncStorage.getItem('company_id')
      const response = await axios.post(`${SERVER_URL}getCompanyCanvasCheckinFeature`, {
        company_id,
      })
      console.log(response.data?.payload?.canvas_checkin_feature, 'getCompanyCanvasCheckinFeature')
      this.setState({
        canvas_checkin_feature: response.data?.payload?.canvas_checkin_feature
      })
      return response?.data
    } catch (error) {
      console.log(error)
    }
  }

  setTableData(date) {
    var tableData = []
    var scheduleListData = []

    let dateString = moment(date).format("YYYY-MM-DD")

    let startDateTime = moment(date).startOf('day');
    let endDateTime = moment(date).endOf('day');
    this.state.schedules.filter(function (fitem) {
      // console.log(moment(fitem.schedule_datetime), startDateTime, moment(fitem.schedule_datetime), endDateTime, fitem.check_out_datetime)
      return (moment(fitem.schedule_datetime) > startDateTime && moment(fitem.schedule_datetime) < endDateTime);
    })?.map?.(item => {
      // this.state.scheduleData.map(item => {
      let datetime = item.schedule_datetime;
      console.log(datetime)
      let date = datetime.split(' ')[0].split('-')[1] + "/" + datetime.split(' ')[0].split('-')[2]
      let time = datetime.split(' ')[1].split(':')[0] + ":" + datetime.split(' ')[1].split(':')[1]
      let schedule_id = item.schedule_id;
      let client_name = item.client_entity_name;
      let client_id = item.client_id
      let check_in_datetime = item.check_in_datetime
      let check_out_datetime = item.check_out_datetime
      console.log("checkindatetime===> ", check_in_datetime, check_out_datetime)
      let check_in = 'No'
      let check_out = 'No'
      if (check_in_datetime != "0000-00-00 00:00:00") {
        check_in = 'Yes'
        if (check_out_datetime != "0000-00-00 00:00:00") {
          check_out = 'Yes'
        }
      }
      let tableRow = {
        schedule_id,
        client_name: client_name,
        date: date,
        time: time,
        client_id: client_id,
        check_in: check_in,
        check_out: check_out
      }
      tableData.push(tableRow)

      //Schedule Alarm List

      let s_date = moment(datetime).subtract('00:15:00')
      // let s_date = moment(datetime).subtract('00:15:00').format('YYYY-MM-DD HH:mm:ss')
      console.log('s_date: ', s_date)
      scheduleListData.push(s_date)
    })
    this.setState({
      ...this.state,
      tableData: tableData,
      scheduleListData: scheduleListData
    })
  }

  getCompanyRule(company_id) {
    let body = {
      company_id: company_id
    }
    fetch(`${SERVER_URL}getCompanyById`, {
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
        AsyncStorage.setItem(
          'min_time',
          res.min_schedule_time.toString()
        )
        AsyncStorage.setItem(
          'max_time',
          res.max_schedule_time.toString()
        )
        AsyncStorage.setItem(
          'notes',
          res.notes.toString()
        )
        AsyncStorage.setItem(
          'upload',
          res.upload.toString()
        )
        return true;
      })
      .catch(error => {
        return (error)
      })
  }

  closeControlPanel = () => {
    this._drawer.close()
  };
  openControlPanel = () => {
    this._drawer.open()
  };

  showDatePicker = () => {
    this.setState({ datePickerVisible: true });
  }

  hideDatePicker = () => {
    this.setState({ datePickerVisible: false });
  }

  handleDatePicker = date => {
    this.setState({
      datePickerVisible: false,
      date: moment(date).format('ddd, Do MMM YYYY'),
      error: ''
    });
    this.setTableData(date)
  }

  onItemClicked = (item) => {
    this.setState({
      isLoadingModal: true,
      showModal: true
    })
    //getClientInfo by name
    let body = {
      client_id: item.client_id
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
        this.setState({
          ...this.state,
          isLoadingModal: false,
          showModal: true,
          selectedItem: item,
          client_info: {
            client_id: item.client_id,
            client_entity_name: res.client_entity_name,
            custom_field: res.custom_field,
            address: res.address,
            latitude: res.location.split(' ')[0],
            longitude: res.location.split(' ')[1],
            schedule_id: item.schedule_id
          }
        });
        console.log(res)
        // this.setState({  })
        return true;
        // return res;
        // resolve(res);
      })
      .catch(error => {
        this.setState({
          isLoadingModal: false,
          showModal: false
        })
        return (error)
      })
  }

  gotoDirectCheckin = () => {
    this.props.navigation.navigate('DirectCheckin', {client_info: this.state.client_info})
  }

  gotoCheckin = () => {
    this.props.navigation.navigate('Checkin', {client_info: this.state.client_info})
  }

  gotoCheckout = () => {
    this.props.navigation.navigate('Checkout', {client_info: this.state.client_info})
  }

  getDirection = () => {
    console.log("Go to direction clicked");

    openMap({ latitude: Number(this.state.client_info.latitude), longitude: Number(this.state.client_info.longitude), provider: 'google', zoom: 10, navigate: true })
    this.setState({ showModal: false });
  };

  onClose = () => {
    this.setState({ showModal: false });
  };

  renderStatus = (item) => {
    if (item.check_in === "No" && item.check_out === "No") {
      return(
        <View style={{ backgroundColor: "#F84A4A", minWidth: 90, paddingVertical: 6, paddingHorizontal: 4, justifyContent: "center", alignItems: "center", borderRadius: 8 }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: "700" }}>PENDING</Text>
        </View>
      )
    }else if(item.check_in === "Yes" && item.check_out === "No"){
      return(
        <View style={{ backgroundColor: "#FBBB3F", minWidth: 90, paddingVertical: 6, paddingHorizontal: 4, justifyContent: "center", alignItems: "center", borderRadius: 8 }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: "700" }}>KUNJUNGAN</Text>
        </View>
      )
    }else if(item.check_in === "Yes" && item.check_out === "Yes"){
      return(
        <View style={{ backgroundColor: "#2ABB41", minWidth: 90, paddingVertical: 6, paddingHorizontal: 4, justifyContent: "center", alignItems: "center", borderRadius: 8 }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: "700" }}>SUKSES</Text>
        </View>
      )
    }
  }

  hasPassed = () => {
    if (new Date(this.state.selectedDate) < new Date(moment().format("YYYY-MM-DD"))) {
      return true
    } else {
      return false
    }
  }

  onRefresh = async () => {
    console.log('refreshing')
    this.setState({
      refreshing: true
    });
    this.getCompanyCanvasCheckinFeature();
    // await this.getAbsent();
    this.getSchedule(() => {
      this.setState({
        refreshing: false,
        selectedDate: moment().format('YYYY-MM-DD')
      });
    })
  };

  handleOpenURL = () => {
    const url = 'https://forms.gle/R3v726bSiFud6bHx6';

    // Open the URL in the device's browser
    Linking.openURL(url).catch((err) =>
      console.error('An error occurred', err)
    );
  };

  render() {
    const drawerStyles = {
      drawer: { backgroundColor: 'white' },
      main: { paddingLeft: 3 },
    }
    const { update, alarmId } = this.state;
    return (
      <ScrollView
        contentContainerStyle={{flex: 1}}
        refreshControl={
          <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />
        }
      >
        <Drawer
          type="static"
          tapToClose={true}
          content={
            <View style={{
              alignItems: 'center',
              marginTop: 30
            }}>
              <Image style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                marginBottom: 20
              }} source={require('../../assets/user.png')} />
              <Text style={{
                fontWeight: 'bold',
                fontSize: 15,
                marginBottom: 10
              }}>Hi, {this.state.full_name} </Text>
              <View style={{
                height: 0.4,
                backgroundColor: 'black',
                width: '100%'
              }}>
              </View>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate('CreateClientScreen')
                }}
                style={{
                  elevation: 8,
                  backgroundColor: "white",
                  borderRadius: 5,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  margin: 10,
                  width: '70%',
                  marginTop: 30,
                }}>
                <Text style={{
                  fontSize: 15,
                  color: "#991100",
                  fontWeight: "bold",
                  alignSelf: "center",
                  textTransform: "uppercase"
                }}>Klien Baru</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate('ClientDB');
                }}
                style={{
                  elevation: 8,
                  backgroundColor: "white",
                  borderRadius: 5,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  margin: 10,
                  width: '70%',
                }}>
                <Text style={{
                  fontSize: 15,
                  color: "#991100",
                  fontWeight: "bold",
                  alignSelf: "center",
                  textTransform: "uppercase"
                }}>Kontak</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate('ResourceScreen');
                }}
                style={{
                  elevation: 8,
                  backgroundColor: "white",
                  borderRadius: 5,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  margin: 10,
                  width: '70%',
                }}>
                <Text style={{
                  fontSize: 15,
                  color: "#991100",
                  fontWeight: "bold",
                  alignSelf: "center",
                  textTransform: "uppercase"
                }}>File</Text>
              </TouchableOpacity>
              {this.state.company_id === '30' && (
                <TouchableOpacity
                  onPress={() => {
                    this.handleOpenURL;
                  }}
                  style={{
                    elevation: 8,
                    backgroundColor: 'white',
                    borderRadius: 5,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    margin: 10,
                    width: '70%',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: '#991100',
                      fontWeight: 'bold',
                      alignSelf: 'center',
                      textTransform: 'uppercase',
                    }}
                  >
                    Google Form
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => {
                  console.log("log out button clicked")
                  Alert.alert(
                    'Log out',
                    'Please confirm log out.',
                    [
                      {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel'
                      },
                      {
                        text: 'OK', onPress: () => {
                          // logout
                          console.log('logout v2')
                          AsyncStorage.setItem("user_id", '')
                          AsyncStorage.removeItem("user")
                            .then(() => {
                              this.props.setUser({})
                            })
                          this.props.logout();

                          this.props.navigation.navigate('Login');
                        }
                      }
                    ],
                    { cancelable: false }
                  );
                  // this.onBackButtonClicked()
                }}
                style={{
                  elevation: 8,
                  backgroundColor: "white",
                  borderRadius: 5,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  margin: 10,
                  width: '70%',
                }}>
                <Text style={{
                  fontSize: 15,
                  color: "#991100",
                  fontWeight: "bold",
                  alignSelf: "center",
                  textTransform: "uppercase"
                }}>Log out</Text>
              </TouchableOpacity>

            </View>
          }
          ref={(ref) => this._drawer = ref}
          openDrawerOffset={0.5}
          styles={drawerStyles}
          closedDrawerOffset={-3}
          tweenHandler={Drawer.tweenPresets.parallax}
        >

          <View style={styles.container}>
            <View style={styles.avatarContainer}>
              <View style={{ position: 'absolute', left: 0 }}>
                <TouchableOpacity style={styles.backButton}
                  onPress={this.openControlPanel}

                >
                  <Image style={styles.backButtonIcon} source={require('../../assets/drawer.png')} />
                </TouchableOpacity>
              </View>
              <View style={{ height: '100%', width: '100%', alignItems: 'flex-end', justifyContent: 'flex-start', paddingRight: 12}}>
                <Image source={require('../../assets/logo-login-cropped.png')} style={styles.image} resizeMode="contain" />
              </View>

            </View>
            <Modal
              isVisible={this.state.datePickerVisible}
              onBackdropPress={() => this.setState({ datePickerVisible: false })}
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
              <View style={styles.calendarConntainer}>
                <Calendar
                  current={getInitialDate()}
                  onDayPress={this.onDayPress}
                  markedDates={{
                    [this.state.selectedDate]: {
                      selected: true,
                      disableTouchEvent: true,
                    }
                  }}
                />
              </View>
            </Modal>
            <View style={styles.scheduleList}>
              {/* {
                this.state.absent.absentFeature && (
                  <View style={{marginBottom: 4}}>
                    <TouchableOpacity 
                      disabled={this.state.absent.isCheckIn && this.state.absent.isCheckOut}
                      onPress={this.handleAbsent}>
                      <Card containerStyle={{borderRadius: 12}}>
                        <View style={{
                            borderRadius: 10,
                            paddingVertical: 0,
                            width: "100%",
                            flexDirection: 'row',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <Text style={{fontWeight: "bold", fontSize: 16}}>Absen</Text>
                            <BadgeStatus type={
                              this.state.absent.isCheckIn && this.state.absent.isCheckOut
                                ? 'success'
                                : this.state.absent.isCheckIn
                                ? 'warning'
                                : 'danger'
                            }>
                              {
                                this.state.absent.isCheckIn && this.state.absent.isCheckOut
                                  ? 'Check Out'
                                  : this.state.absent.isCheckIn
                                  ? 'Check In'
                                  : 'Belum Absen'
                              }
                            </BadgeStatus>
                        </View>
                      </Card>
                    </TouchableOpacity>
                  </View>
                )
              } */}
              {
                this.state.canvas_checkin_feature ? (
                  <View>
                    <TouchableOpacity onPress={this.gotoDirectCheckin}>
                      <Card containerStyle={{borderRadius: 12}}>
                        <View style={{
                            borderRadius: 10,
                            paddingVertical: 4,
                            width: "100%",
                            flexDirection: 'row',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <Text style={{fontWeight: "bold", fontSize: 16}}>Canvas Check In</Text>
                            <AntDesign size={24} name="pluscircleo" />
                        </View>
                      </Card>
                    </TouchableOpacity>
                  </View>
                ) : null
              }
              <View style={{marginBottom: 10}}>
                <TouchableOpacity onPress={() => {
                  this.props.navigation.navigate('Schedule')
                }}>
                  <Card containerStyle={{borderRadius: 12}}>
                    <View style={{
                        borderRadius: 10,
                        paddingVertical: 4,
                        width: "100%",
                        flexDirection: 'row',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Text style={{fontWeight: "bold", fontSize: 16}}>Buat Jadwal</Text>
                        <AntDesign size={24} name="pluscircleo" />
                    </View>
                  </Card>
                </TouchableOpacity>
              </View>
              <View style={{height: 24, backgroundColor: "#f7f7f7"}}></View>
              <View style={styles.homeTitle}>
                <Text style={styles.homeTitleText}>Perjalanan Saya</Text>
              </View>
              <TouchableOpacity onPress={() => this.setState({datePickerVisible: true})} style={{marginBottom: 12}}>
                <Card containerStyle={{borderRadius: 12, paddingVertical: 4}}>
                  <View style={{
                      borderRadius: 10,
                      paddingVertical: 4,
                      width: "100%",
                      flexDirection: 'row',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Text style={styles.scheduleTitle}>{moment(this.state.selectedDate).format('dddd, DD MMMM YYYY')}</Text>
                      <AntDesign size={16} name="down" />
                  </View>
                </Card>
              </TouchableOpacity>
              <ScrollView>
                {
                  this.state.tableData.map((item, index) => (
                    <TouchableOpacity
                    key={index}
                    onPress={() => { this.onItemClicked(item) }}
                    >
                      <Card containerStyle={{borderRadius: 12}}>
                        {/*react-native-elements Card*/}
                        <View style={{
                          flexDirection: 'row',
                          width: "100%",
                          height: 48,
                          display: 'flex',
                          justifyContent: 'space-between',
                          borderRadius: 10,
                          alignItems: 'center'
                        }}>
                          <View style={{flexDirection: 'row'}}>
                            <View style={{marginRight: 20}}>
                              <Text style={{ fontSize: 16, fontWeight: "900" }}>
                                {item.time}
                              </Text>
                            </View> 
                            <View style={{
                              flex: 1,
                              maxWidth: Dimensions.get('screen').width / 2.75,
                            }}>
                              <Text style={{ fontSize: 16, fontWeight: 'bold', textTransform: "capitalize" }}>
                                {item.client_name}
                              </Text>
                            </View>
                          </View>
                          {this.renderStatus(item)}
                        </View>

                      </Card>

                    </TouchableOpacity>
                    )
                  )
                }
              </ScrollView>
            </View>
            
            <Modal
              isVisible={this.state.showModal}
              onBackdropPress={() => this.setState({ showModal: false })}
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
                this.state.isLoadingModal
                  ?
                  <Spinner color="#5589e6" />
                  :
                <View style={styles.modalContainer}>
                  <Text style={{ fontWeight: 'bold', fontSize: 25, marginBottom: 0 }}>{this.state.selectedItem.client_name}</Text>
                  <View style={styles.modalDivider}>
                  </View>
                  <View>
                    <Text style={{ fontSize: 20, marginBottom: 20, marginTop: 20 }}>Client Name: {this.state.client_info.client_entity_name}</Text>
                    {/* <Text style={{ fontSize: 20, marginBottom: 20 }}>Client Owner Name: {this.state.client_info.custom_field}</Text> */}
                    <Text style={{ fontSize: 20, marginBottom: 20 }}>Address: {this.state.client_info.address}</Text>
                    {/* <Text style={{ fontSize: 20, marginBottom: 20 }}>{this.state.client_info.custom_field}</Text> */}
                    {
                      // <Text style={{ fontSize: 20, marginBottom: 20 }}>{this.state.client_info.custom_field}</Text>
                      this.state.client_info.custom_field != null &&
                      <>
                        {
                          this.state.client_info.custom_field.split(', ').map(item => {
                            return <Text style={{ fontSize: 20, marginBottom: 20 }}>{item}</Text>
                          })
                        }
                      </>

                    }
                  </View >
                  <View style={styles.modalBottomDivider}>
                  </View>
                  {
                    this.hasPassed()
                      ?
                      null
                      :
                    <View style={{ flexDirection: 'row', }}>
                      {
                        this.state.selectedItem?.check_in === "No"
                        ?
                        <TouchableOpacity onPress={this.gotoCheckin} style={styles.buttonContainer}>
                          <Text style={styles.buttonText}>CHECK IN</Text>
                        </TouchableOpacity>
                        :
                        null
                      }
                      {
                        this.state.selectedItem?.check_out === "No" && this.state.selectedItem?.check_in === "Yes"
                        ?
                        <TouchableOpacity onPress={this.gotoCheckout} style={styles.buttonContainer}>
                          <Text style={styles.buttonText}>CHECK OUT</Text>
                        </TouchableOpacity>
                        :
                        null
                      }
                    </View>
                  }
                  <View style={{ flexDirection: 'row', }}>

                    <TouchableOpacity onPress={this.getDirection} style={styles.buttonContainer}>
                      <Text style={styles.buttonText}>GET DIRECTION</Text>
                    </TouchableOpacity>
                    {/* <TouchableOpacity onPress={this.onClose} style={styles.buttonContainer}>
                      <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity> */}
                  </View>

                  {/* <Button title="GET DIRECTION" style={{ height: 30, width: '80%', marginTop: 30 }} onPress={this.getDirection} /> */}
                </View>
              }
            </Modal>
          </View>
        </Drawer>
      </ScrollView>
    );
  }


};


const mapStateToProps = state => ({
  schedules: state.schedules,
  // client_info: state.client_info
})

const mapDispatchToProps = dispatch => bindActionCreators({
  getSchedule: scheduleActions.getSchedule,
  logout: userActions.logout,
  getClientProfileById: clientActions.getClientProfileById,
  setUser
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Home);
