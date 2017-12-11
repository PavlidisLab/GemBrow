import {Col, Label, Row} from "reactstrap";
import * as React from "react";
import "./inputRow.css"

const InputRow = (props) => (
    <div className={"input-row "+(props.className?props.className:"")}>
        <Row>
            <Col>
                <Label for={props.id}>{props.label}</Label>
            </Col>
            <Col className={"text-right"} id={props.id}>
                {props.input}
            </Col>
        </Row>
    </div>
)

export default InputRow;