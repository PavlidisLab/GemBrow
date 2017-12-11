import {combineReducers} from 'redux';
import {loadDatasetsFailure, loadDatasetsLoading, loadDatasetsSuccess} from "../pages/datasets/reducer";
import {reducer as notifications} from 'react-notification-system-redux';
import {loadPlatformsFailure, loadPlatformsLoading, loadPlatformsSuccess} from "../pages/platforms/reducer";
import {loadTaxaFailure, loadTaxaLoading, loadTaxaSuccess} from "./components/taxonSelector/reducer";

export default combineReducers({
    notifications,
    loadDatasetsLoading,
    loadDatasetsFailure,
    loadDatasetsSuccess,
    loadPlatformsLoading,
    loadPlatformsFailure,
    loadPlatformsSuccess,
    loadTaxaLoading,
    loadTaxaFailure,
    loadTaxaSuccess
});