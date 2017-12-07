import {Col, Label, Row} from "reactstrap";
import * as React from "react";
import "./inputRow.css"

const InputRow = (props) => (
    <div className="input-row">
        <Row>
            <Col>
                <Label for={props.id}>{props.label}</Label>
            </Col>
            <Col className="text-right">
                {props.input}
            </Col>
        </Row>
    </div>
)

export default InputRow;