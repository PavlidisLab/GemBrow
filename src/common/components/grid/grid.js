import * as React from "react";
import "./grid.css"
import {Col, Container, Row} from 'reactstrap';
import Expandable from "../expandableBlock/expandableBlock";
import InputRow from "./InputRow/InputRow";
import Spinner from "../spinner/spinner";
import Toggle from 'react-toggle'
import ToggleIcon from "../toggleIcon/toggleIcon";
import FontAwesome from 'react-fontawesome'

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

            <InputRow
                className="columns-all-row"
                id="columns-all"
                label={
                    <span className="bigger-label">
                        <h5>Columns</h5>
                    </span>
                }
                input={
                    <Toggle
                        icons={{
                            unchecked: <ToggleIcon r icon={"all"}/>,
                            checked: <ToggleIcon fa icon={<FontAwesome name="filter"/>}/>
                        }}
                        defaultChecked={true}/>
                }
            />

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
        <Container fluid className={"grid " + props.className}>
            <Row>
                <Col xl={3} lg={4} xs={12} className="grid-params">
                    <div className="params-hide-button"><FontAwesome name="chevron-left"/></div>

                    <div>
                        <Expandable body={gridSettings} className="grid-settings" label="Table settings"/>
                    </div>

                    <div className="grid-data-params">
                        {props.selectors}
                    </div>
                </Col>
                <Col xl={9} lg={8} xs={12} className="grid-body">
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