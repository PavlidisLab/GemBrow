import InputRow from "../grid/InputRow/InputRow";
import * as React from "react";
import ToggleIcon from "../toggleIcon/toggleIcon";
import FontAwesome from 'react-fontawesome'
import Toggle from 'react-toggle'
import {connect} from "react-redux";
import {loadTaxa} from "./actions";
import Expandable from "../expandableBlock/expandableBlock";
import "./taxonSelector.css"

const TAXA_VISIBLE_AMOUNT = 5;

class TaxonSelector extends React.Component {

    componentDidMount() {
        this.props.fetchData();
    }

    render() {

        // const taxaError = this.props.apiErrorTaxa;
        // const taxaLoading = this.props.loadingTaxa;
        const taxaHasData = this.props.taxa.length > 0;

        const visTaxa = taxaHasData
            ? this.props.taxa.slice(0, TAXA_VISIBLE_AMOUNT).map((taxon, i) =>
                <InputRow id={'taxon-toggle-' + taxon.ncbiId} key={i}
                          label={taxon.commonName ? taxon.commonName : taxon.scientificName}
                          input={
                              <Toggle
                                  defaultChecked={true}/>
                          }/>)
            : ""

        const hiddenTaxa = taxaHasData
            ? this.props.taxa.slice(TAXA_VISIBLE_AMOUNT).map((taxon, i) =>
                <InputRow id={'taxon-toggle-' + taxon.ncbiId} key={i}
                          label={taxon.commonName ? taxon.commonName : taxon.scientificName}
                          input={
                              <Toggle
                                  defaultChecked={true}/>
                          }/>)
            : ""

        const expandLabel = "" + (this.props.taxa.length - TAXA_VISIBLE_AMOUNT) + " more"

        const taxonSelectorContent =
            <div className="taxon-selector-content">
                <InputRow
                    id="taxa-all-toggle"
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
                            defaultChecked={false}/>
                    }/>
                {visTaxa}
                <Expandable body={hiddenTaxa} className="taxa-expandable-panel" label={expandLabel}/>
            </div>

        return (
            <Expandable expanded body={taxonSelectorContent} className="taxon-selector" label={<h5>Taxa</h5>}/>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        taxa: state.loadTaxaSuccess,
        apiErrorTaxa: state.loadTaxaFailure,
        loadingTaxa: state.loadTaxaLoading
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        fetchData: () => dispatch(loadTaxa())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TaxonSelector);