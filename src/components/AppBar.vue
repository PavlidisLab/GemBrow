<template>
    <v-app-bar app>
        <a :href="baseUrl + '/home.html'" style="display: flex; align-content: center;">
            <img
                    id=" logo"
                    :src="require('@/assets/logo-current.png')"
                    height="50"
                    alt="The Gemma Browser logo"
            />
        </a>
        <div class="d-none d-md-flex px-3">
            {{ title }}
        </div>
        <v-menu v-if="filterSummary && filterDescription" style="align-self: center; padding-left: 15px;" offset-y>
            <template v-slot:activator="{ on, attrs }">
                <v-btn plain v-bind="attrs" v-on="on" style="text-transform: none;"> {{ filterSummary }}
                    <v-icon>mdi-chevron-down</v-icon>
                </v-btn>
            </template>
            <v-card flat max-width="650px" class="scroll">
                <v-card-text>
                    <div v-for="(line, lineIndex) in filterDescription.split('\n')" :key="lineIndex">
                  <span v-for="(word, wordIndex) in line.split(' ')" :key="lineIndex + '-' + wordIndex"
                        :class="{ andOrStyle: word === 'AND' || word === 'OR'}">
                    {{ word }}&nbsp;
                  </span>
                    </div>
                </v-card-text>
            </v-card>
        </v-menu>
        <v-spacer/>
        <v-switch v-if="devMode" v-model="debug" label="Debug Mode" hide-details class="d-none d-sm-flex px-4"/>
        <v-btn fab small tile depressed @click="showDocumentationWindow = true"
               class="d-none d-sm-flex px-4">
            <v-icon>mdi-help-circle-outline</v-icon>
        </v-btn>
        <DocumentationWindow v-model="showDocumentationWindow"/>
        <v-menu open-on-hover offset-y>
            <template v-slot:activator="{on, attrs}">
                <v-btn plain v-bind="attrs" v-on="on">
                    Explore
                    <v-icon>mdi-chevron-down</v-icon>
                </v-btn>
            </template>
            <v-list>
                <v-list-item>
                    <form :action="baseUrl + '/searcher.html'" method="get" class="d-flex align-baseline">
                        <v-text-field v-model="query" label="Search" autofocus @click.stop autocomplete="off"
                                      name="query"></v-text-field>
                        <v-btn type="submit" class="ml-2" :disabled="!query || query.trim().length === 0">Go</v-btn>
                    </form>
                </v-list-item>
                <v-divider/>
                <v-list-item link to="/">
                    Browse Datasets
                </v-list-item>
                <v-list-item link :href="baseUrl + '/expressionExperiment/showAllExpressionExperiments.html'">
                    Browse Datasets (legacy)
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
                <v-list-item link @click="showAboutDialog = true">About Gemma</v-list-item>
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
                <v-list-item link @click="updateWhatsNew()">Update "What's New"</v-list-item>
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
                <v-list-item link @click="logout()">Logout</v-list-item>
            </v-list>
        </v-menu>
        <a href="https://www.ubc.ca/" target="_blank"
           title="UBC home page"
           class="d-flex align-center pl-3">
            <img
                    :src="require('@/assets/ubc-logo-current.png')"
                    height="40"
                    alt="UBC Logo"
            />
        </a>
        <AboutDialog v-model="showAboutDialog"/>
    </v-app-bar>
</template>

<script>
import { axiosInst, baseUrl } from "@/config/gemma";
import { mapMutations, mapState } from "vuex";
import AboutDialog from "@/components/AboutDialog.vue";
import DocumentationWindow from "@/components/DocumentationWindow.vue";
import { swallowCancellation } from "@/lib/utils";

export default {
  name: "AppBar",
  components: { AboutDialog, DocumentationWindow },
  data() {
    return {
      baseUrl: baseUrl,
      showAboutDialog: false,
      showDocumentationWindow: false,
      query: null,
      devMode: process.env.NODE_ENV !== "production"
    };
  },
  methods: {
    ...mapMutations(["setLastError"]),
    updateMyself() {
      return this.$store.dispatch("api/getMyself")
        .catch(swallowCancellation)
        .catch(e => {
          console.error("Failed to update user info: " + e.message + ".", e);
          this.setLastError(e);
        });
    },
    updateWhatsNew() {
      return axiosInst.get(baseUrl + "/whatsnew/generateCache.html")
        .then(() => window.location.reload())
        .catch(swallowCancellation)
        .catch(e => {
          console.error(`Failed to update "What's New": ${e.message}`, e);
          this.setLastError(e);
        });
    },
    logout() {
      return axiosInst.get(baseUrl + "/j_spring_security_logout")
        .then(this.updateMyself)
        .catch(swallowCancellation)
        .catch(e => {
          console.error(`Failed to logout: ${e.message}`, e);
          this.setLastError(e);
        });
    }
  },
  computed: {
    ...mapState({
      title: state => state.title,
      filterSummary: state => state.filterSummary,
      filterDescription: state => state.filterDescription,
      myself(state) {
        if (state.api.myself === undefined) {
          return null;
        }
        return state.api.myself.code === 401 ? null : state.api.myself.data;
      }
    }),
    debug: {
      get() {
        return this.$store.state.debug;
      },
      set(newVal) {
        this.$store.commit("setDebug", !!newVal);
      }
    }
  },
  created() {
    this.updateMyself();
    window.addEventListener("focus", this.updateMyself);
  }
};
</script>

<style scoped>
.v-list-item--link {
    font-weight: normal;
}

.scroll {
    overflow-y: scroll;
    max-height: calc(100vh - 100px);
}

.andOrStyle {
    font-weight: bold;
    font-style: italic;
    color: rgb(42, 42, 223);
}
</style>