import {StyleSheet} from 'react-native';
import {black, grayBackgroundLight, primaryDark, white, yellow} from "../../styles/colors";
import {boxShadow, margin, padding, screenWidth} from "../../styles/mixins";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: white,
    },
    mainContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatarContainer: {
        width: screenWidth,
        height: '10%',
        backgroundColor: 'white',
        marginTop: '5%',
        flexDirection:'row'
    },
    imageBackground: {
        width: screenWidth,
        height: screenWidth
    },
    backButton: {
        width: 35,
        height: 35,
        position: 'absolute',
        start: 0,
        margin: 15,
    },
    backButtonIcon: {
        width: 20,
        height: 20,
        alignSelf: 'center'
    },
    cameraButton: {
        width: 40,
        height: 40,
        position: 'absolute',
        end: 0,
        alignSelf: 'flex-end',
        alignContent: 'center',
        justifyContent: 'center',
        borderRadius: 50,
        backgroundColor: '#fff',
        margin: 20,
        ...boxShadow()
    },
    loginContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    error: {
        color: 'red',
        fontWeight: 'bold',
        position: 'absolute'
    },
    accountTypeContainer: {
        width: screenWidth - 50,
        height: 50,
        justifyContent: 'center',
        marginBottom: 15,
        backgroundColor: primaryDark,
        alignItems: 'center',
        flexDirection: 'row',
        alignContent: 'center',
        ...padding(10, 0)
    },
    buttonPrimaryDark: {
        flex: 1,
        height: 40,
        backgroundColor: primaryDark,
        borderRadius: 1,
        borderColor: primaryDark,
        borderWidth: 0,
        textAlign: 'center',
        justifyContent: 'center',
        ...padding(10, 20),
        ...margin(0, 5)
    },
    buttonGreen: {
        flex: 1,
        height: 40,
        backgroundColor: 'green',
        borderRadius: 1,
        borderColor: primaryDark,
        borderWidth: 0,
        textAlign: 'center',
        justifyContent: 'center',
        ...padding(10, 20),
        ...margin(0, 5)
    },
    inputContainer: {
        flexDirection: 'row',
        width: screenWidth - 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
        borderStyle: 'solid',
        backgroundColor: 'white',
        borderWidth: 1.5,
        borderColor: '#d9d9d9',
        marginBottom: 20,
    },
    inputLatLong: {
        flexDirection: 'row',
        width: '40%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 7,
        backgroundColor: 'white',
        borderWidth: 0.2,
        marginBottom: 20,
        marginLeft:10,
        marginRight: 10,
        backgroundColor: '#eeeeee',
    },
    inputIcon: {
        width: 15,
        height: 15,
        marginLeft: 5
    },
    inputBox: {
        width: screenWidth - 85,
        height: 50,
        marginLeft: 5,
        color: black,
    },
    inputLatLongBox: {
        // width: screenWidth - 85,
        height: 50,
        color: black,
    },
    time: {
        width: screenWidth - 85,
        color: 'black',
        fontSize: 14,
        textAlignVertical: 'center',
        alignSelf: 'center',
        marginLeft: 10
    },
    buttonContainer: {
        width: screenWidth - 40,
        height: 40,
        backgroundColor: '#5589e6',
        borderRadius: 7,
        marginBottom: 10,
        fontWeight: '500',
        fontFamily: 'sans-serif',
        textAlign: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    image: {
        width: screenWidth/2.5,
        height: '100%',
    },
});

export default styles;