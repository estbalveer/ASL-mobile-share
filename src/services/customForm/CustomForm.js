import { SERVER_URL } from "../../common/config";
// import ScheduleReducer from '../../redux/reducers/ScheduleReducer'
export const customFormService = {
    getCustomUploadField,
};
function getCustomUploadField(company_id, form_name) {
    let body = {
        company_id,
        form_name
    }
    return new Promise((resolve, reject) => {
        fetch(`${SERVER_URL}getCustomUploadField`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
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
        })
    })
}

