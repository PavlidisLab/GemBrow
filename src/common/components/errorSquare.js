import './errorSquare.css';
import 'bootstrap/dist/css/bootstrap.css';
import * as React from "react";
import {Col, Container, Row} from "reactstrap";

const ErrorSquare = (props) => (
    <Container className="error-square">
        <Row>
            <Col xs="12" lg="8">
                <h2>There was a problem, and Gemma is sorry... </h2>
                <h3>{props.code}</h3>
                <p>{props.message}</p>
                <hr/>
                <p>Common issues can usually be resolved by reloading the webpage, or logging in again.</p>
                <p>If this problem prevails, please let us know.</p>
            </Col>
            <Col xs="12" lg="4">
                <div className="sad-gemma"/>
            </Col>
        </Row>
    </Container>
);

export default ErrorSquare;