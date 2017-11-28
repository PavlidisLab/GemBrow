import {combineReducers} from 'redux';
import {loadDatasetsFailure, loadDatasetsLoading, loadDatasetsSuccess} from "../pages/datasets/reducer";
import {reducer as notifications} from 'react-notification-system-redux';

export default combineReducers({
    notifications,
    loadDatasetsLoading,
    loadDatasetsFailure,
    loadDatasetsSuccess
});