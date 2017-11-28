import * as actions from './actions';

export function loadDatasetsLoading(state = false, action) {
    switch (action.type) {
        case actions.LOAD_DATASETS_LOADING:
            return action.loading;
        default:
            return state;
    }
}

export function loadDatasetsFailure(state = false, action) {
    switch (action.type) {
        case actions.LOAD_DATASETS_FAILURE:
            return action.error;
        default:
            return state;
    }
}

export function loadDatasetsSuccess(state = [], action) {
    switch (action.type) {
        case actions.LOAD_DATASETS_SUCCESS:
            return action.datasets;
        default:
            return state;
    }
}