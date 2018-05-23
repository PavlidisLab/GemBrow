/* eslint-disable */
import Vue from "vue";
import Vuex from "vuex";
import api from "./modules/vapi";
import main from "./modules/main"
import {ds, pf} from "./modules/searchSettings";

Vue.use(Vuex);

// noinspection JSUnresolvedVariable
const debug = process.env.NODE_ENV !== "production";

api.namespaced = true;

export default new Vuex.Store({
    modules: {
        main: main,
        api: api,
        dss: ds, // dss for DataSets Settings
        pfs: pf // pfs for PlatForms Settings
    },
    strict: debug
});
