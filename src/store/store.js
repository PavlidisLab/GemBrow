/* eslint-disable */
import Vue from "vue";
import Vuex from "vuex";
import api from "./modules/vapi";
import main from "./modules/main"
import datasetsSearchSettings from "./modules/datasetsSearchSettings";

Vue.use(Vuex);

// noinspection JSUnresolvedVariable
const debug = process.env.NODE_ENV !== "production";

export default new Vuex.Store({
  modules: {
    main: main,
    api: api,
    dss: datasetsSearchSettings, // das for DataSets Settings
  },
  strict: debug
});
