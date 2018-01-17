import InputRow from "../grid/InputRow/InputRow";
import * as React from "react";
import ToggleIcon from "../toggleIcon/toggleIcon";
import FontAwesome from 'react-fontawesome'
import Toggle from 'react-toggle'
import Expandable from "../expandableBlock/expandableBlock";
import "./troubleSelector.css"

class TroubledSelector extends React.Component {

    render() {
        const troubleSelectorContent =
            <div className="taxon-selector-content">
                <InputRow
                    id="troubled-all-toggle"
                    label={
                        <span className="bigger-label">
                            All
                        </span>
                    }
                    input={
                        <Toggle
                            icons={{
                                checked: <ToggleIcon fa icon={<FontAwesome name="check"/>}/>,
                                unchecked: <ToggleIcon fa icon={<FontAwesome name="filter"/>}/>
                            }}
                            defaultChecked={false}
                            />
                    }/>

                <InputRow id="troubled-toggle"
                          label="Troubled"
                          input={
                              <Toggle
                                  defaultChecked={true}/>
                          }
                          count={123}/>

                <InputRow id="not-troubled-toggle"
                          label="Not troubled"
                          input={
                              <Toggle
                                  defaultChecked={true}/>
                          }
                          count={2}/>

                <InputRow id="batch-effect-toggle"
                          label="Batch effect"
                          input={
                              <Toggle
                                  defaultChecked={true}/>
                          }
                          count={23}/>

                <InputRow id="batch-confound-toggle"
                          label="Batch confound"
                          input={
                              <Toggle
                                  defaultChecked={true}/>
                          }
                          count={45}/>

                <InputRow id="no-batch-info-toggle"
                          label="No batch info"
                          input={
                              <Toggle
                                  defaultChecked={true}/>
                          }
                          count={14}/>
            </div>

        return (
            <Expandable body={troubleSelectorContent} className="taxon-selector" label={<h5>Quality</h5>}/>
        )
    }
}

export default TroubledSelector;