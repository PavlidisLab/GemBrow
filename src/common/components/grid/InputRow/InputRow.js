import {Col, Label, Row} from "reactstrap";
import * as React from "react";
import "./inputRow.css"

const InputRow = (props) => (
    <div className={"input-row "+(props.className?props.className:"")}>
        <Row>
            <Col xs={props.count ? 8 : 10}>
                <Label for={props.id}>{props.label}</Label>
            </Col>
            {props.count ?
                <Col xs={2} className={"input-row-count text-right"} >
                    {props.count}
                </Col>
                :''
            }
            <Col xs={2} className={"input-row-input text-right"} id={props.id}>
                {props.input}
            </Col>
        </Row>
    </div>
)

export default InputRow;