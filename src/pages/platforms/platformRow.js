import * as React from "react";

const PlatformRow = (props) => (
    <div className="platform-row">
       <span className='short-name'>{props.vo.shortName}</span>
       <span className='name'>{props.vo.name}</span>
       <span className='taxon'>Taxon: {props.vo.taxon}</span>
       <span className='source'>Datasets: {props.vo.expressionExperimentCount}</span>
    </div>
)

export default PlatformRow;