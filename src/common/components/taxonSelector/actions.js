import apiCall from "../apiCall";

export const LOAD_TAXA_LOADING = 'LOAD_TAXA_LOADING';
export const LOAD_TAXA_FAILURE = 'LOAD_TAXA_FAILURE';
export const LOAD_TAXA_SUCCESS = 'LOAD_TAXA_SUCCESS';

const taxaErrorNotifyOpts = (error) => {
    return {
        title: 'API Error ' + error.code,
        message: error.message,
        position: 'tr',
        autoDismiss: 500,
        uid: 'error_taxa_api_failure' + error.code
    }
};

export function loadTaxa() {
    const url = 'http://localhost:8080/Gemma/rest/v2/taxa';
    return (dispatch) => {
        apiCall(url, dispatch, loadTaxaLoading, loadTaxaFailure, loadTaxaSuccess, taxaErrorNotifyOpts)
    }
}

export function loadTaxaLoading(bool) {
    return {
        type: LOAD_TAXA_LOADING,
        loading: bool
    };
}

export function loadTaxaFailure(error) {
    return {
        type: LOAD_TAXA_FAILURE,
        error: error
    };
}

export function loadTaxaSuccess(taxa) {
    return {
        type: LOAD_TAXA_SUCCESS,
        taxa
    };
}