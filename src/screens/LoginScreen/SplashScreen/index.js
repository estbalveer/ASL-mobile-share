import React, { Component } from 'react';
import { connect } from "react-redux";
import { View, StatusBar, Image, Text, Platform, BackHandler, ActivityIndicator, Modal, Dimensions } from 'react-native';
import { AppStyles } from "../../../styles/styles";
import AsyncStorage from '@react-native-community/async-storage';
import { bindActionCreators } from "redux";
// import * as authActions from "_actions/authActions";
import WaitingDialog from "../../../components/waitingDialog";

class SplashScreen extends Component {

    constructor(props) {
        super();
        this.state = {
            isLoading: false
        };
        this._isMounted = false;
    }

    componentDidMount() {
        AsyncStorage.getItem('user').then((value) => {
            const userLoginData = JSON.parse(value);
            if (userLoginData) {
                this.gotoHome(userLoginData)
            } else {
                this.gotoLogin()
            }
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    gotoLogin = () => {
        this.props.navigation.navigate("Login");
    }

    gotoHome = (value) => {
        if (value?.isAdmin) {
            this.props.navigation.navigate("Admin");
        } else {
            this.props.navigation.navigate("Main");
        }
    }

    updateLoadingStatus = bool => {
        this.setState({ isLoading: bool });
    }

    render() {
        return (
            <View style={[AppStyles.containerWhite, AppStyles.centered]}>
                <StatusBar barStyle='light-content' backgroundColor='#2459b8' />
                <Image style={{ width: "100%", height: "100%"}} source={require('../../../assets/splash_screen.png')} />
                <Modal transparent={true} visible={this.state.isLoading} animationType='fade'
                    onRequestClose={() => this.updateLoadingStatus(false)}>
                    <WaitingDialog />
                </Modal>
                {/* <Text style={{ marginTop: '50%', }}>Schedule, Track, Forecast</Text> */}
            </View>
        );
    }
}

const mapStateToProps = state => {
    return {
        login_user: state.login_user
    }
}

const mapDispatchToProps = dispatch => {
    return {
        // authActions: bindActionCreators(authActions, dispatch),
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(SplashScreen);