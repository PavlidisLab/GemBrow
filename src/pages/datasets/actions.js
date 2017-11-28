import {error} from "react-notification-system-redux";

export const LOAD_DATASETS_LOADING = 'LOAD_DATASETS_LOADING';
export const LOAD_DATASETS_FAILURE = 'LOAD_DATASETS_FAILURE';
export const LOAD_DATASETS_SUCCESS = 'LOAD_DATASETS_SUCCESS';


const linkErrorNotifyOpts = {
    title: 'Communication error',
    message: 'There was a problem connecting to the Gemma server',
    position: 'tr',
    autoDismiss: 0,
};

const datasetsErrorNotifyOpts = (error) => {
    return {
        title: 'API Error ' + error.code,
        message: error.message,
        position: 'tr',
        autoDismiss: 500,
    }
};

export function loadDatasets() {

    const url = 'http://localhost:8080/Gemma/rest/v2/datasets/';

    return (dispatch) => {
        dispatch(loadDatasetsLoading(true));

        fetch(url)
            .then((response) => {
                return response.json()
            })
            .then((json) => {
                dispatch(loadDatasetsLoading(false));
                if (json.error !== undefined) {
                    dispatch(loadDatasetsFailure(json.error));
                    dispatch(error(datasetsErrorNotifyOpts(json.error)));
                } else {
                    dispatch(loadDatasetsSuccess(json.data));
                }
            })
            .catch(() => {
                dispatch(loadDatasetsLoading(false));
                dispatch(error(linkErrorNotifyOpts));
            })

    }
}

export function loadDatasetsLoading(bool) {
    return {
        type: LOAD_DATASETS_LOADING,
        loading: bool
    };
}

export function loadDatasetsFailure(error) {
    return {
        type: LOAD_DATASETS_FAILURE,
        error: error
    };
}

export function loadDatasetsSuccess(datasets) {
    return {
        type: LOAD_DATASETS_SUCCESS,
        datasets
    };
}