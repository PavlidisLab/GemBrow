<template>
    <v-app-bar app>
        <v-app-bar-nav-icon to="/">
            <img
                    id="logo"
                    :src="require('@/assets/logo-icon.png')"
                    class="themeable light"
                    alt="The Gemma Browser logo"
            />
        </v-app-bar-nav-icon>
        <v-toolbar-title>
            Gemma
        </v-toolbar-title>
        <v-spacer/>
        <v-menu open-on-hover offset-y>
            <template v-slot:activator="{on, attrs}">
                <form method="get">
                    <v-btn plain v-bind="attrs" v-on="on">
                        Explore
                        <v-icon>mdi-chevron-down</v-icon>
                    </v-btn>
                </form>
            </template>
            <v-list>
                <v-list-item>
                    <v-text-field label="Search"></v-text-field>
                    <v-btn>Go</v-btn>
                </v-list-item>
                <v-divider/>
                <v-list-item link :href="baseUrl + '/expressionExperiment/showAllExpressionExperiments.html'">
                    Browse Datasets
                </v-list-item>
                <v-list-item link :href="baseUrl + '/arrays/showAllArrayDesigns.html'">
                    Browse Platforms
                </v-list-item>
            </v-list>
        </v-menu>
        <v-menu open-on-hover offset-y>
            <template v-slot:activator="{attrs, on}">
                <v-btn plain v-bind="attrs" v-on="on">
                    About
                    <v-icon>mdi-chevron-down</v-icon>
                </v-btn>
            </template>
            <v-list>
                <v-list-item link :href="baseUrl + '/'">About Gemma</v-list-item>
                <v-list-item link href="https://pavlidislab.github.io/Gemma/">Help and Documentation</v-list-item>
            </v-list>
        </v-menu>
        <v-menu v-if="myself && (myself.group === 'Users' || myself.group === 'Administrators')" open-on-hover
                offset-y>
            <template v-slot:activator="{attrs, on}">
                <v-btn plain v-bind="attrs" v-on="on">
                    My Gemma
                    <v-icon>mdi-chevron-down</v-icon>
                </v-btn>
            </template>
            <v-list>
                <v-list-item link :href="baseUrl + '/expressionExperiment/upload.html'">Load Data</v-list-item>
                <v-list-item link
                             :href="baseUrl + '/expressionExperiment/showAllExpressionExperimentLinkSummaries.html'">
                    Dataset Manager
                </v-list-item>
                <v-list-item link :href="baseUrl + '/geneGroupManager.html'">Gene Groups</v-list-item>
                <v-list-item link :href="baseUrl + '/expressionExperimentSetManager.html'">Experiment Groups
                </v-list-item>
                <v-divider/>
                <v-list-item link :href="baseUrl + '/userProfile.html'">Edit Profile</v-list-item>
            </v-list>
        </v-menu>
        <v-menu v-if="myself && (myself.group === 'Administrators')" open-on-hover offset-y>
            <template v-slot:activator="{attrs, on}">
                <v-btn plain v-bind="attrs" v-on="on">
                    Admin
                    <v-icon>mdi-chevron-down</v-icon>
                </v-btn>
            </template>
            <v-list>
                <v-list-item link :href="baseUrl + '/admin/loadExpressionExperiment.html'">Add Data</v-list-item>
                <v-list-item link :href="baseUrl + '/admin/geoRecordBrowser.html'">Browse GEO</v-list-item>
                <v-list-item link :href="baseUrl + '/characteristicBrowser.html'">Search Annotations</v-list-item>
                <v-divider/>
                <v-list-item link :href="baseUrl + '/admin/userManager.html'">Manager Users</v-list-item>
                <v-list-item link :href="baseUrl + '/admin/activeUsers.html'">View Active Sessions</v-list-item>
                <v-list-item link :href="baseUrl + '/admin/systemStats.html'">System Monitoring</v-list-item>
                <v-list-item link :href="baseUrl + '/admin/indexer.html'">Manage Search Indexes</v-list-item>
                <v-list-item link :href="baseUrl + '/admin/maintenanceMode.html'">Manage Maintenance Mode</v-list-item>
                <v-list-item link :href="baseUrl + '/whatsnew/generateCache.html'">Update "What's New"</v-list-item>
                <v-list-item link :href="baseUrl + '/admin/widgetTest.html'">Widget Test Page</v-list-item>
            </v-list>
        </v-menu>
        <v-menu v-if="myself" open-on-hover offset-y>
            <template v-slot:activator="{attrs, on}">
                <v-btn plain v-bind="attrs" v-on="on">
                    {{ myself.userName }}
                    <v-icon>mdi-chevron-down</v-icon>
                </v-btn>
            </template>
            <v-list>
                <v-list-item link :href="baseUrl + '/userProfile.html'">Edit your profile</v-list-item>
                <v-list-item link :href="baseUrl + '/'">Logout</v-list-item>
            </v-list>
        </v-menu>
        <a href="https://www.ubc.ca/" target="_blank" title="UBC home page">
            <img
                    src="https://dev.gemma.msl.ubc.ca/images/logo/ubcgrey_logo_40.png"
                    height="30px"
                    alt="UBC Logo"
            />
        </a>
    </v-app-bar>
</template>

<script>
import { baseUrl } from "@/config/gemma";
import { mapState } from "vuex";

export default {
  name: "AppBar",
  data() {
    return {
      baseUrl: baseUrl
    };
  },
  computed: mapState({
    myself: state => state.api.myself.status === 401 ? null : state.api.myself.data
  }),
  created() {
    this.$store.dispatch("api/getMyself");
    window.addEventListener("focus", () => {
      this.$store.dispatch("api/getMyself");
    });
  }
};
</script>
