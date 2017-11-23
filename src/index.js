import React from 'react';
import WebFont from 'webfontloader';
import {render} from 'react-dom'
import {BrowserRouter} from 'react-router-dom'
import App from './components/App';
import './styles/index.css';
import 'bootstrap/dist/css/bootstrap.css';
import registerServiceWorker from './registerServiceWorker';

WebFont.load({
    google: {
        families: ['Montserrat|Roboto:400,700', 'sans-serif']
    }
});

render((
    <BrowserRouter>
        <App/>
    </BrowserRouter>
), document.getElementById('root'));

registerServiceWorker();