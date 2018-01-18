import {Col, Label, Row} from "reactstrap";
import * as React from "react";
import "./inputRow.css"

const InputRow = (props) => (
    <div className={"input-row "+(props.className?props.className:"")}>
        <Row>
            <Col className={"input-row-label " + (props.count ? "count" : "no-count")}>
                <Label for={props.id}>{props.label}</Label>
            </Col>
            {props.count ?
                <Col className={"input-row-count text-right "} >
                    {props.count}
                </Col>
                :''
            }
            <Col className={"input-row-input text-right " + (props.count ? "count" : "no-count")} id={props.id}>
                {props.input}
            </Col>
        </Row>
    </div>
)

export default InputRow;