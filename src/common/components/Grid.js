import * as React from "react";
import "./grid.css"

export const EmptyRow = () => (
    <div className="empty-row"/>
)

const Grid = (props) => {
    let emptyRows = Array.from(new Array(props.size - props.rows.length));
    emptyRows = emptyRows.map(row => <EmptyRow/>);

    return (
        <div className="grid">
            {props.rows.map((row, i) => <div key={i} className={"grid-row " + (props.loading ? "row-loading" : "row-loaded") }> {row} </div>)}
            {emptyRows.map((row, i) => <div key={i} className={"grid-row " + (props.loading ? "row-loading" : "row-loaded") }>{row}</div>)}
        </div>
    )
}

export default Grid;