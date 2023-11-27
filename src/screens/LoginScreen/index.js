/* eslint-disable react/jsx-no-undef */
import React, { Component } from 'react';
import {
  KeyboardAvoidingView,
  StyleSheet,
  Image,
  ImageBackground,
  View,
  Easing,
  Text,
  Animated,
  TextInput,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';

import { bindActionCreators } from 'redux';
import { useSelector, connect } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import { userActions } from "../../redux/actions/AuthAction";
import { successMessage, errorMessage } from '../../utils/alerts';
import SimpleToast from "react-native-simple-toast";

import logoImg from '../../assets/logo-login.png';
import emailImg from '../../assets/email.png';
import passwordImg from '../../assets/password.png';
import eyeImg from '../../assets/eye_black.png';

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const MARGIN = 40;

class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPass: true,
      press: false,
      email: '',
      password: '',
      isLoading: false
    };
    this.showPass = this.showPass.bind(this);
    this._onPress = this._onPress.bind(this);
    this._onCreate = this._onCreate.bind(this);
    this._onForgot = this._onForgot.bind(this);
  }

  // componentDidMount() 

  componentDidUpdate(prevProps, _) {
    if (JSON.stringify(this.props.login_user) !== JSON.stringify(prevProps.login_user)) {
      let userData = this.props.login_user
      if (this.state.isLoading) {
        if (userData.error != null) {
          SimpleToast.show("Login Failed.")
          this.setState({ isLoading: false })
        } else if (userData.login_user != []) {
          if (userData.login_user.isActive == 1) {
            AsyncStorage.setItem(
              'user_id',
              userData.login_user.user_id.toString()
            );
            AsyncStorage.setItem(
              'company_id',
              userData.login_user.company_id.toString()
            );
            AsyncStorage.setItem(
              'full_name',
              userData.login_user.full_name
            );
            AsyncStorage.setItem(
              'isAdmin',
              userData.login_user.isAdmin
            );
            SimpleToast.show("Login Success!")
            console.log("storage===>", userData.login_user.user_id)
            if (userData.login_user.isAdmin) {
              this.props.navigation.navigate('Admin');
            } else {
              this.props.navigation.navigate('Main');
            }
          } else {
            SimpleToast.show("Your account is not active.")
          }
        } else if (userData.login_user.isAdmin == 1) {
          SimpleToast.show("Permission error!")
          this.setState({ isLoading: false })
        } else if (userData.login_user.user_id == 0) {
          SimpleToast.show("Enter correct email or password")
          this.setState({ isLoading: false })
        }
      }
    }
  }

  showPass() {
    this.state.press === false
      ? this.setState({ showPass: false, press: true })
      : this.setState({ showPass: true, press: false });
  }


  emailValidate = email => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(email) === false) {
      this.setState({ error: 'Email is incorrect', email: email });
      return false;
    } else {
      this.setState({ error: '', email: email });
    }
  }


  _onPress() {
    if (this.state.email === '') {
      SimpleToast.show('Enter email', SimpleToast.SHORT);
    } else if (this.state.password === '') {
      SimpleToast.show('Enter password', SimpleToast.SHORT);
    } else if (this.emailValidate(this.state.email) == false) {
      SimpleToast.show('Enter valid email', SimpleToast.SHORT);
    } else {
      this.setState(prevState => ({
        prevState,
        isLoading: true
      }))
      this.props.login(this.state.email, this.state.password)

    }

  }

  _onCreate() {
    this.props.navigation.navigate('Register');
  }

  _onForgot() {
    this.props.navigation.navigate('ForgotPassword');
  }

  render() {
    return (
      <ImageBackground style={styles.picture}>
        <View style={styles.container}>
          <Image source={logoImg} style={styles.image} />
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              returnKeyType="done"
              placeholderTextColor="gray"
              autoCapitalize="none"
              autoCorrect={false}
              underlineColorAndroid="transparent"
              value={this.state.email}
              onChangeText={(val) => {
                this.setState({ email: val });
              }}
            />
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              onChangeText={(val) => {
                this.setState({ password: val });
              }}
              style={styles.input}
              placeholder="Password"
              returnKeyType="done"
              placeholderTextColor="gray"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={this.state.showPass}
              underlineColorAndroid="transparent"
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.btnEye}
            onPress={this.showPass}>
            <Image source={eyeImg} style={styles.iconEye} />
          </TouchableOpacity>
        </KeyboardAvoidingView>
        <View style={styles.signupContainer}>
          <Text style={styles.signupText} onPress={() => this._onCreate()}>Create Account</Text>
          <Text style={styles.signupText} onPress={() => this._onForgot()}>Forgot Password?</Text>
        </View>
        <View style={styles.buttonContainer}>
          {/* <Animated.View style={{ width: changeWidth }}> */}
          <TouchableOpacity
            style={styles.button}
            onPress={this._onPress}
            activeOpacity={1}>
            <Text style={styles.buttonText}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  picture: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'cover',
    backgroundColor: 'white'
  },
  container: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 220,
    height: 80,
  },
  text: {
    color: 'black',
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    fontSize: 40,
    marginTop: 20,
  },
  input: {
    flexDirection: 'row',
    width: DEVICE_WIDTH - 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    borderStyle: 'solid',
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#d9d9d9',
    marginBottom: 20,
    paddingLeft: 10,
    paddingRight: 10
  },
  inlineImg: {
    position: 'absolute',
    zIndex: 99,
    width: 22,
    height: 22,
    left: 35,
    top: 9,
  },
  formContainer: {
    flex: 1,
    alignItems: 'center',
  },
  btnEye: {
    position: 'absolute',
    top: 63,
    right: 28,
  },
  iconEye: {
    width: 25,
    height: 25,
    tintColor: 'rgba(0,0,0,0.2)',
    marginTop: 5,
    marginRight: 5
  },
  buttonContainer: {
    flex: 1,
    top: -95,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5589e6',
    height: MARGIN,
    width: '90%',
    borderRadius: 5,
    zIndex: 100,
  },
  circle: {
    height: MARGIN,
    width: MARGIN,
    marginTop: -MARGIN,
    borderWidth: 1,
    borderColor: '#F035E0',
    borderRadius: 100,
    alignSelf: 'center',
    zIndex: 99,
    backgroundColor: '#FFFFFF',
  },
  buttonText: {
    color: 'white',
    backgroundColor: 'transparent',
  },
  buttonImage: {
    width: 24,
    height: 24,
  },
  signupContainer: {
    flex: 1,
    top: 85,
    width: DEVICE_WIDTH,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 100,
  },
  signupText: {
    color: 'blue',
    backgroundColor: 'transparent',
  },
});

const mapStateToProps = state => ({
  login_user: state.login_user
})

const mapDispatchToProps = dispatch => bindActionCreators({
  login: userActions.login
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);
