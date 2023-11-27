/* eslint-disable no-trailing-spaces */
/* eslint-disable prettier/prettier */
import AsyncStorage from '@react-native-community/async-storage';
import { userService } from '../../services/auth/Auth';
import { CLEAR_SIGNUP_USER, FETCH_LOGIN_REQUEST,LOG_OUT, FETCH_LOGIN_SUCCESS, FETCH_LOGIN_ERROR, FETCH_SIGNUP_REQUEST, FETCH_SIGNUP_SUCCESS, FETCH_SIGNUP_ERROR ,FETCH_RESET_REQUEST, FETCH_RESET_SUCCESS, FETCH_RESET_ERROR } from '../constants'
export const userActions = {
    login,
    logout,
    register,
    resetPassword,
    // getAll,
    // delete: _delete
};

function login(email, password) {
    return async dispatch => {
        try {
            dispatch(request());
            const login_user = await userService.login(email, password);
            console.log(login_user, 'login_user')
            await AsyncStorage.setItem(
                'user',
                JSON.stringify(login_user)
            );
            dispatch(success(login_user));
        } catch (error) {
            console.log(error)
            dispatch(failure(error.toString()));
        }
    };

    function request() { return { type: FETCH_LOGIN_REQUEST } }
    function success(login_user) { return { type: FETCH_LOGIN_SUCCESS, login_user } }
    function failure(error) { return { type: FETCH_LOGIN_ERROR, error } }
}

function register(data) {
    
    return dispatch => {
        dispatch(request());

        userService.register(data)
            .then(
                
                signup_user => {
                    dispatch(success(signup_user));
                    // history.push('/');
                    dispatch(clearSignupUser());
                }
                )
            .catch(
                error => {
                    console.log(error)
                    dispatch(failure(error.toString()));
                    // dispatch(alertActions.error(error.toString()));
                }
            );
    };

    function request() { return { type: FETCH_SIGNUP_REQUEST } }
    function success(signup_user) { return { type: FETCH_SIGNUP_SUCCESS, signup_user } }
    function failure(error) { return { type: FETCH_SIGNUP_ERROR, error } }
    function clearSignupUser() { return {type: CLEAR_SIGNUP_USER} }
}

function resetPassword(data) {
    
    return dispatch => {
        dispatch(request());

        userService.resetPassword(data)
            .then(
                
                reset_user => {
                    dispatch(success(reset_user));
                    // history.push('/');
                })
            .catch(
                error => {
                    console.log(error)
                    dispatch(failure(error.toString()));
                    // dispatch(alertActions.error(error.toString()));
                }
            );
    };

    function request() { return { type: FETCH_RESET_REQUEST } }
    function success(reset_user) { return { type: FETCH_RESET_SUCCESS, reset_user } }
    function failure(error) { return { type: FETCH_RESET_ERROR, error } }
}

function logout() {
    return async dispatch => {
        await AsyncStorage.removeItem('user')
        dispatch({type: LOG_OUT});
    };
}


