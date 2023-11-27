/* eslint-disable no-trailing-spaces */
/* eslint-disable prettier/prettier */
import { createMapTrackingService } from '../../services/mapTracking/CreateMapTracking';
import { FETCH_CREATE_MAP_TRACKING_ERROR, FETCH_CREATE_MAP_TRACKING_REQUEST, FETCH_CREATE_MAP_TRACKING_SUCCESS } from '../constants';
export const createMapTrackingActions = {
    createMapTracking,
};

function createMapTracking(params) {
    return dispatch => {
        dispatch(request(params));

        createMapTrackingService.createMapTracking(params)
            .then(
                
                payload => {
                    dispatch(success(payload));
                    console.log('create tracker')
                    // history.push('/');
                })
            .catch(
                error => {
                    console.log(error)
                    dispatch(failure(error.toString()));
                }
            );
    };

    function request(params) { return { type: FETCH_CREATE_MAP_TRACKING_REQUEST, params } }
    function success(payload) { return { type: FETCH_CREATE_MAP_TRACKING_SUCCESS, payload } }
    function failure(error) { return { type: FETCH_CREATE_MAP_TRACKING_ERROR, error } }
}
