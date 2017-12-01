import apiCall from "../../common/components/apiCall";

export const LOAD_DATASETS_LOADING = 'LOAD_DATASETS_LOADING';
export const LOAD_DATASETS_FAILURE = 'LOAD_DATASETS_FAILURE';
export const LOAD_DATASETS_SUCCESS = 'LOAD_DATASETS_SUCCESS';

const datasetsErrorNotifyOpts = (error) => {
    return {
        title: 'API Error ' + error.code,
        message: error.message,
        position: 'tr',
        autoDismiss: 500,
        uid: 'error_dataset_api_failure' + error.code
    }
};

export function loadDatasets() {
    const url = 'http://gemma.msl.ubc.ca/rest/v2/datasets/';
    return (dispatch) => {
        apiCall(url, dispatch, loadDatasetsLoading, loadDatasetsFailure, loadDatasetsSuccess, datasetsErrorNotifyOpts)
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