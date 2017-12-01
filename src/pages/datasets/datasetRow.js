import * as React from "react";

const DatasetRow = (props) => (
    <div className="dataset-row">
       <span className='short-name'>{props.vo.shortName}</span>
       <span className='name'>{props.vo.name.length > 100 ? props.vo.name.substring(0,100)+"..." : props.vo.name}</span>
       <span className='taxon'>Taxon: {props.vo.taxon}</span>
       <span className='source'>Source: {props.vo.externalDatabase}</span>
    </div>
)

export default DatasetRow;