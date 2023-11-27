// import {data} from "../fake-datas/UserViewData"
import { FETCH_CREATE_MAP_TRACKING_REQUEST, FETCH_CREATE_MAP_TRACKING_SUCCESS, FETCH_CREATE_MAP_TRACKING_ERROR } from "../constants"
const initialState = {
    loading: false,
    checkin_user: [],
    error: null
}

export default function CreateMapTrackingReducer(state = initialState, action) {
    switch(action.type) {
        case FETCH_CREATE_MAP_TRACKING_REQUEST: 
            console.log('fetch request ...')
            return {
                ...state,
                loading: true
            }
        case FETCH_CREATE_MAP_TRACKING_SUCCESS:
            console.log('fetch success ...')
            return {
                ...state,
                loading: false,
                // userview: [...data]
                checkin_user: action.checkin_user
            }
        case FETCH_CREATE_MAP_TRACKING_ERROR:
            console.log('fetch error ...')
            return {
                ...state,
                loading: false,
                error: 'error'
            }
        default: 
            return state;
    }
}
