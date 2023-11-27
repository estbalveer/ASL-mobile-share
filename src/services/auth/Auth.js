import { SERVER_URL } from "../../common/config";
import LoginReducer from '../../redux/reducers/LoginReducer'
export const userService = {
    login,
    // logout,
    register,
    resetPassword
};
function login(email, password) {
    console.log(email, password)
    let body = {
        email: email,
        password: password,
    }
    return new Promise((resolve, reject) => {
        fetch(`${SERVER_URL}login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
        .then(res => {
            return res.json()
        })
        .then(res => {
            console.log(res, 'ressssss')
            if(res?.error) {
                throw(res?.error);
            }
            resolve(res);
        })
        .catch(error => {
            reject(error)
        })
    })
}

function register(data) {
    
    return new Promise((resolve, reject) => {
        console.log('server url', SERVER_URL)
        fetch(`${SERVER_URL}signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(res => {
            return res.json()
        })
        .then(res => {
            if(res.error) {
                throw(res.error);
            }
            // return res;
            resolve(res);
        })
        .catch(error => {
            reject(error)
            // return error
        })
    })
}

function resetPassword(data) {
    console.log("reset data ====>", data)
    return new Promise((resolve, reject) => {
        fetch(`${SERVER_URL}resetPassword`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(res => {
            return res.json()
        })
        .then(res => {
            if(res.error) {
                throw(res.error);
            }
            // return res;
            console.log(res)
            resolve(res);
        })
        .catch(error => {
            reject(error)
            // return error
        })
    })
}
