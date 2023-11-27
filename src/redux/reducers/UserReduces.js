// import {data} from "../fake-datas/AdminData"
const user = {
}

export default function UserReducer(state = user, action) {
    switch (action.type) {
        case 'SET_USER':
            return {
                ...action.payload
            }
        default:
            return state;
    }
}
