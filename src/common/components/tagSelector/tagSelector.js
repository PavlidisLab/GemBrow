import InputRow from "../grid/InputRow/InputRow";
import * as React from "react";
import ToggleIcon from "../toggleIcon/toggleIcon";
import FontAwesome from 'react-fontawesome'
import Toggle from 'react-toggle'
import Expandable from "../expandableBlock/expandableBlock";
import "./tagSelector.css"

class TagSelector extends React.Component {

    render() {
        const troubleSelectorContent =
            <div className="taxon-selector-content">
                <InputRow
                    id="tag-all-toggle"
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

                <InputRow id="tag-toggle-1"
                          label={<span title="Name | Category [evidence]">Brain <span className="sub-label">Organism part</span> <span>[IEA]</span></span>}
                          input={
                              <Toggle
                                  defaultChecked={true}/>
                          }
                          count={1234}/>

                <InputRow id="tag-toggle-2"
                          label={<span title="Name | Category [evidence]">Blood <span className="sub-label">Organism part</span> <span>[IC]</span></span>}
                          input={
                              <Toggle
                                  defaultChecked={true}/>
                          }
                          count={1023}/>

                <InputRow id="tag-toggle-3"
                          label={<span title="Name | Category [evidence]">Frontal cortex <span className="sub-label">Organism part</span> <span>[IC]</span></span>}
                          input={
                              <Toggle
                                  defaultChecked={true}/>
                          }
                          count={950}/>

                <InputRow id="tag-toggle-3"
                          label={<span title="Name | Category [evidence]">Parkinson's disease <span className="sub-label">Disease</span> <span>[IEA]</span></span>}
                          input={
                              <Toggle
                                  defaultChecked={true}/>
                          }
                          count={456}/>

            </div>

        return (
            <Expandable body={troubleSelectorContent} className="taxon-selector" label={<h5>Tags</h5>}/>
        )
    }
}

export default TagSelector;