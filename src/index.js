import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.min.css'
import React from 'react';
import WebFont from 'webfontloader';
import {render} from 'react-dom'
import {Provider} from "react-redux";
import {BrowserRouter} from 'react-router-dom'
import App from './app';
import registerServiceWorker from './common/registerServiceWorker';
import configureStore from './common/configureStore';

const store = configureStore();

WebFont.load({
    google: {
        families: ['Montserrat|Roboto:400,700', 'sans-serif']
    }
});

render((
    <Provider store={store}>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    </Provider>
), document.getElementById('root'));

registerServiceWorker();