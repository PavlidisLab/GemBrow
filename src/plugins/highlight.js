import Vue from 'vue';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import R from 'highlight.js/lib/languages/r';
import bash from 'highlight.js/lib/languages/bash';
import http from 'highlight.js/lib/languages/http';
import VueHighlightJS from '@highlightjs/vue-plugin';

import 'highlight.js/styles/default.css';

hljs.registerLanguage('python', python);
hljs.registerLanguage('r', R);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('http', http);

Vue.use(VueHighlightJS);

export default VueHighlightJS;