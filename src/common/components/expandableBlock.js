import * as React from "react";
import "./expandableBlock.css"
import {Collapse} from "react-collapse";

class ExpandableBlock extends React.Component {

    state = {
        expanded: this.props.expanded ? this.props.expanded : false
    };

    expand = (bool) => (e) => {
        //FIXME convert to redux
        this.setState({expanded: bool});
    }

    render() {
        return (
            <div className={"expandable-container " + (this.props.className ? this.props.className : '' )}>
                <div className={"label " + (this.state.expanded ? 'expanded' : 'collapsed')}
                     onClick={this.expand(!this.state.expanded)}>
                    <span className="fa fa-fw fa-align-left fa-caret-right"/>
                    {this.props.label}
                </div>

                <Collapse isOpened={this.state.expanded}>
                    {this.props.body}
                </Collapse>
            </div>
        )
    }
}

export default ExpandableBlock;