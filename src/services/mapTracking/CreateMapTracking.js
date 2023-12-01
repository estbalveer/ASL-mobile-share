import { SERVER_URL } from "../../common/config";
export const createMapTrackingService = {
    createMapTracking,
};
function createMapTracking(body) {
    return new Promise((resolve, reject) => {
        console.log(`${SERVER_URL}createMapTracker`)
        fetch(`${SERVER_URL}createMapTracker`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
        .then(res => {
            return res.json()
        })
        .then(res => {
            if(res?.error) {
                throw(res.error);
            }
            // return res;
            resolve(res);
        })
        .catch(error => {
            console.error(error,'error track location')
            reject(error)
        })
    })
}

