import * as React from "react";
import './subHeader.css';

const SubHeader = (props) => (
    <div className='sub-header'>
        <h2>{props.title}</h2>
        {props.components.map((prop,i) => <div key={i} className="sub-header-prop"> {prop} </div>)}
    </div>
)

export default SubHeader;