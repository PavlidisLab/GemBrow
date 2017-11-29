import React from 'react'
import Header from './common/header'
import Datasets from "./pages/datasets/page";
import Platforms from "./pages/platforms/page";
import Home from "./pages/home/home";
import {Route, Switch} from 'react-router-dom'
import Notifier from './common/notifier'

const App = () => (
    <div>
        <Header/>
        <Notifier/>
        <main>
            <Switch>
                <Route exact path='/' component={Home}/>
                <Route path='/datasets' component={Datasets}/>
                <Route path='/platforms' component={Platforms}/>
            </Switch>
        </main>
    </div>
)

export default App;
