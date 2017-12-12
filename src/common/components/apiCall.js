import {error} from "react-notification-system-redux";

const CONN_ERR_TITLE = 'Connection error'
const CONN_ERR_MSG = 'Can not connect to the Gemma server';

// const linkErrorNotifyOpts = {
//     title: CONN_ERR_TITLE,
//     message: CONN_ERR_MSG,
//     position: 'tr',
//     autoDismiss: 0,
//     uid: 'error_link_failure'
// };

/**
 * Creates an API call. If there is a communication problem, shows an error notification.
 * @param url the url to call
 * @param dispatch the dispatch to use
 * @param loadingAction action that takes a bool parameter, called when the call begins and finishes.
 * @param failureAction action that takes a json error object, called when the call fails.
 * @param successAction action that takes a json data object, called when the call succeeds.
 * @param failureNotifyOpts notification options that are used to show an error when the call fails.
 * @constructor
 */
const ApiCall = (url, dispatch, loadingAction, failureAction, successAction, failureNotifyOpts) => {

    dispatch(loadingAction(true));
    fetch(url)
        .then((response) => {
            return response.json()
        })
        .then((json) => {
            dispatch(loadingAction(false));
            if (json.error !== undefined) {
                dispatch(failureAction(json.error));
                dispatch(error(failureNotifyOpts(json.error)));
            } else {
                dispatch(failureAction(false))
                dispatch(successAction(json.data));
            }
        })
        .catch(() => {
            dispatch(loadingAction(false));
            dispatch(failureAction({code: CONN_ERR_TITLE, message: CONN_ERR_MSG}));
            //dispatch(error(linkErrorNotifyOpts));
        })
}

export default ApiCall