import * as actions from './actions';

export function loadPlatformsLoading(state = false, action) {
    switch (action.type) {
        case actions.LOAD_PLATFORMS_LOADING:
            return action.loading;
        default:
            return state;
    }
}

export function loadPlatformsFailure(state = false, action) {
    switch (action.type) {
        case actions.LOAD_PLATFORMS_FAILURE:
            return action.error;
        default:
            return state;
    }
}

export function loadPlatformsSuccess(state = [], action) {
    switch (action.type) {
        case actions.LOAD_PLATFORMS_SUCCESS:
            return action.datasets;
        default:
            return state;
    }
}