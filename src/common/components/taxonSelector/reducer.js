import * as actions from './actions';

export function loadTaxaLoading(state = false, action) {
    switch (action.type) {
        case actions.LOAD_TAXA_LOADING:
            return action.loading;
        default:
            return state;
    }
}

export function loadTaxaFailure(state = false, action) {
    switch (action.type) {
        case actions.LOAD_TAXA_FAILURE:
            return action.error;
        default:
            return state;
    }
}

export function loadTaxaSuccess(state = [], action) {
    switch (action.type) {
        case actions.LOAD_TAXA_SUCCESS:
            return action.taxa;
        default:
            return state;
    }
}