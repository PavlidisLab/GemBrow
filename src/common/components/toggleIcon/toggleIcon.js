import * as React from "react";
import './toggleIcon.css'

const ToggleIcon = (props) => (
    <span className={"toggle-icon "+(props.fa?"fa ":"")+(props.r?"r ":"")}>
        {props.icon}
    </span>
)

export default ToggleIcon;