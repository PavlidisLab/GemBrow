import React from 'react';
import {Route, Switch} from 'react-router-dom'
import Datasets from "./Datasets";
import Home from "./Home";

const Main = () => (
    <main>
        <Switch>
            <Route exact path='/' component={Home}/>
            <Route path='/datasets' component={Datasets}/>
        </Switch>
    </main>
)

export default Main
