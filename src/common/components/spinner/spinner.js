import React from 'react';
import {Button, Input, InputGroup, InputGroupButton} from 'reactstrap';
import "./spinner.css"
import FontAwesome from 'react-fontawesome'

class Spinner extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            counter: this.props.start ? this.props.start : this.props.min
        }
    }

    //TODO convert to redux
    increment = () => (e) => {
        let val = this.state.counter + this.props.step > this.props.max ? this.props.max : this.state.counter + this.props.step;
        this.setState({counter: val})
    }

    decrement = () => (e) => {
        let val = this.state.counter - this.props.step < this.props.min ? this.props.min : this.state.counter - this.props.step;
        this.setState({counter: val})
    }

    render() {
        return (
            <div className="spinner">
                <InputGroup size="sm">
                    <InputGroupButton>
                        <Button id="left" onClick={this.decrement()}>
                            <FontAwesome name="minus"/>
                        </Button>
                    </InputGroupButton>
                    <Input value={this.state.counter}/>
                    <InputGroupButton>
                        <Button id="right" onClick={this.increment()}>
                            <FontAwesome name="plus"/>
                        </Button>
                    </InputGroupButton>
                </InputGroup>
            </div>
        )
    }
}

export default Spinner;