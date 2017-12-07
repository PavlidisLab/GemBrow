import * as React from "react";
import "./grid.css"
import {Col, Container, Row} from 'reactstrap';
import Expandable from "../expandableBlock";
import InputRow from "../InputRow";
import Spinner from "../Spinner/spinner";
import Toggle from 'react-toggle'

export const EmptyRow = () => (
    <div className="empty-row"/>
)

const Grid = (props) => {
    const emptyRowsSize = props.size - props.data.length > 0 ? props.size - props.data.length : 0;
    let emptyRows = Array.from(new Array(emptyRowsSize));
    emptyRows = emptyRows.map(row => <EmptyRow/>);

    const gridSettings =
        <div className="grid-settings-content">
            <InputRow id="inputPageSize" label="Page size" input={
                <Spinner min={10} max={100} start={20} step={10} click={this.onChange}
                         className="input-pg-size"/>
            }/>
            <h6>Columns</h6>
            {
                props.cols.data.map(
                    (val, i) => props.cols.hideable[i] ?
                        <InputRow key={i} id={"toggle-" + val} label={props.cols.labels[i]} input={
                            <Toggle
                                defaultChecked={!props.cols.hidden[i]}/>
                        }/>
                        : ""
                )
            }
        </div>


    return (
        <Container fluid className={"grid "+props.className}>
            <Row>
                <Col sm={4} lg={2} className="grid-params">

                    <div>
                        <Expandable body={gridSettings} className="grid-settings" label="Table settings"/>
                    </div>

                    <div className="grid-data-params">
                        <p>This is where the data selectors will be</p>
                    </div>
                </Col>
                <Col sm={8} lg={10} className="grid-body">
                    {props.cols.labels &&
                    <div className="grid-row row-label">
                        <div className="grid-row-content">
                            {props.cols.labels.map((label, i) =>
                                props.cols.hidden[i] ? "" :
                                    <span key={i} className={"label-" + props.cols.data[i]}>{label}</span>
                            )}
                        </div>
                    </div>}

                    {props.data.map((vo, i) =>
                        <div key={i} className={"grid-row " + (props.loading ? "row-loading" : "row-loaded")}>
                            <div className="grid-row-content">
                                {props.cols.data.map(
                                    (col, j) => props.cols.hidden[j] ? "" :
                                        <span key={j} className={"data-" + col}>
                                            {vo[col]}
                                        </span>)}
                            </div>
                        </div>
                    )}

                    {emptyRows.map((row, i) => <div key={i}
                                                    className={"grid-row " + (props.loading ? "row-loading" : "row-loaded")}>{row}</div>)}
                </Col>
            </Row>
        </Container>
    )
}

export default Grid;