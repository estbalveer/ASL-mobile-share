// import {data} from "../fake-datas/AdminData"
import { CLEAR_SIGNUP_USER, FETCH_SIGNUP_REQUEST, FETCH_SIGNUP_SUCCESS, FETCH_SIGNUP_ERROR } from "../constants"
const initialState = {
    loading: false,
    signup_user: [],
    error: null
}

export default function SignupReducer(state = initialState, action) {
    switch(action.type) {
        case FETCH_SIGNUP_REQUEST: 
            return {
                ...state,
                loading: true
            }
        case FETCH_SIGNUP_SUCCESS:
            return {
                ...state,
                loading: false,
                // admin: [...data]
                signup_user: action.signup_user
            }
        case FETCH_SIGNUP_ERROR:
            console.log('fetch error ...')
            return {
                ...state,
                loading: false,
                error: action.error
            }
        case CLEAR_SIGNUP_USER:
            return {
                ...state,
                signup_user: [],
            }
        default: 
            return state;
    }
}
