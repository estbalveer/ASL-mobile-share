import { StyleSheet } from 'react-native';
import { black, grayBackgroundLight, primaryDark, white, yellow } from "../../styles/colors";
import { boxShadow, margin, padding, screenWidth } from "../../styles/mixins";

const styles = StyleSheet.create({
    divider: {
        borderBottomColor: '#666666', // Change the color as needed
        borderBottomWidth: 1,      // Change the thickness as needed
        marginVertical: 10,        // Adjust the vertical spacing as needed
    },
    row: {
        alignSelf: 'flex-start',
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginVertical: 2,
    },
    uploadContainer: {
        backgroundColor: '#eeeeee', // Background color for the button, you can adjust it
        flexDirection: 'row',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20, // Adjust padding as needed
        paddingVertical: 10, // Adjust padding as needed
        width: screenWidth - 40,
      },
    rowItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 5,
        fontWeight: 'bold',
        fontFamily: 'sans-serif',
    },
    informationContainer: {
        display: 'flex'
    },
    otherIcon: {
        width: 15,
        height: 15,
        marginRight: 5,
        marginTop: 2
    },
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
        flexDirection: 'row',
        justifyContent: 'center'
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
        end: 0,
        alignSelf: 'flex-end',
        alignContent: 'center',
        justifyContent: 'center',
        borderRadius: 50,
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginVertical: 10,
        ...boxShadow()
    },
    loginContainer: {
        flex: 1,
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
    inputNote: {
        flexDirection: 'row',
        width: screenWidth - 40,
        height: 80,
        justifyContent: 'center',
        alignItems: 'baseline',
        alignSelf: 'center',
        borderRadius: 7,
        borderColor: '#d9d9d9',
        backgroundColor: 'white',
        borderWidth: 1.5,
        marginBottom: 20,
    },
    inputReason: {
        width: '100%',
        height: 80,
        justifyContent: 'center',
        alignItems: 'baseline',
        borderRadius: 10,
        backgroundColor: 'white',
        marginBottom: 20,
        ...boxShadow()
    },
    inputLatLong: {
        flexDirection: 'row',
        width: '40%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'white',
        marginBottom: 20,
        marginLeft: 10,
        marginRight: 10,
        ...boxShadow()
    },
    inputDropdown: {
        textAlign: 'left',
        fontSize: 14,
        color: '#000000',
        marginLeft: 18
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
        fontSize: 15,
        textAlignVertical: 'center',
        alignSelf: 'center',
        marginLeft: 10
    },
    note: {
        width: '100%',
        color: 'black',
        fontSize: 15,
        textAlignVertical: 'center',
        marginLeft: 10
    },
    buttonContainer: {
        width: screenWidth - 40,
        height: 40,
        backgroundColor: '#5589e6',
        borderRadius: 7,
        marginBottom: 30,
        fontWeight: '500',
        fontFamily: 'sans-serif',
        textAlign: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    image: {
        width: screenWidth / 2.3,
        height: '90%',
    },
    buttonStyle: {
        flex: 1, justifyContent: "center", alignItems: "center", height: 40,
        backgroundColor: "#eeeeee",
        margin: 10,
        borderRadius: 7,
    }
});

export default styles;