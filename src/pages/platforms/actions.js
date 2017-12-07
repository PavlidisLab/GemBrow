import apiCall from "../../common/components/apiCall";

export const LOAD_PLATFORMS_LOADING = 'LOAD_PLATFORMS_LOADING';
export const LOAD_PLATFORMS_FAILURE = 'LOAD_PLATFORMS_FAILURE';
export const LOAD_PLATFORMS_SUCCESS = 'LOAD_PLATFORMS_SUCCESS';

const platformsErrorNotifyOpts = (error) => {
    return {
        title: 'API Error ' + error.code,
        message: error.message,
        position: 'tr',
        autoDismiss: 500,
        uid: 'error_platforms_api_failure' + error.code
    }
};

export function loadPlatforms() {
    const url = 'http://localhost:8080/Gemma/rest/v2/platforms/?limit=100';
    return (dispatch) => {
        apiCall(url, dispatch, loadPlatformsLoading, loadPlatformsFailure, loadPlatformsSuccess, platformsErrorNotifyOpts)
    }
}

export function loadPlatformsLoading(bool) {
    return {
        type: LOAD_PLATFORMS_LOADING,
        loading: bool
    };
}

export function loadPlatformsFailure(error) {
    return {
        type: LOAD_PLATFORMS_FAILURE,
        error: error
    };
}

export function loadPlatformsSuccess(platforms) {
    return {
        type: LOAD_PLATFORMS_SUCCESS,
        datasets: platforms
    };
}