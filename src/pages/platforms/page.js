import React from 'react';
import ErrorSquare from "../../common/components/errorSquare/errorSquare";
import FontAwesome from 'react-fontawesome'
import './style.css'
import Grid from "../../common/components/grid/grid";
import SubHeader from "../../common/components/subHeader/subHeader";
import {loadPlatforms} from "./actions";
import {connect} from "react-redux";
import LoadingCog from "../../common/components/LoadingCog";
import TaxonSelector from "../../common/components/taxonSelector/taxonSelector";
import TroubledSelector from "../../common/components/troubledSelector/troubleSelector";

const TITLE = "Platforms overview"
const PAGE_SIZE = 20;

class PlatformsPage extends React.Component {

    componentDidMount() {
        this.props.fetchData();
    }

    render() {

        const platformsError = this.props.apiErrorPlatforms;
        const platformsLoading = this.props.loadingPlatforms;
        const platformsHasData = this.props.platforms.length > 0;

        const taxaError = this.props.apiErrorTaxa;
        const taxaLoading = this.props.loadingTaxa;
        const taxaHasData = this.props.taxa.length > 0;

        const header =
            <div>
                {platformsLoading
                    ? <LoadingCog active={true} refreshing={platformsHasData} label="platforms"/>
                    : platformsError && platformsHasData
                        ? <p><FontAwesome name='warning'/> Cached platforms</p>
                        : undefined}
                {taxaLoading
                    ? <LoadingCog active={true} refreshing={taxaHasData} label="taxa"/>
                    : taxaError && taxaHasData
                        ? <p><FontAwesome name='warning'/> Cached taxa</p>
                        : undefined}
            </div>

        const gridCols = {
            labels: ["Id", "Name", "Taxon", "Dataset count", "Tags", "Technology"],
            data: ["shortName", "name", "taxon", "expressionExperimentCount", "tags", "technology"],
            hideable: [false, true, true, true, true, true],
            hidden: [false, false, false, false, true, true]
        }

        const selectors =
            <div className="platform-selectors">
                <h4>Filters</h4>
                <TaxonSelector/>
                <TroubledSelector/>
            </div>;

        return (
            <div>
                <SubHeader components={[header]} title={TITLE}/>
                <hr/>
                {platformsError && !(platformsLoading || platformsHasData) &&
                <div>
                    <ErrorSquare code={this.props.apiErrorPlatforms.code}
                                 message={this.props.apiErrorPlatforms.message}/>
                </div>
                }
                {(platformsLoading || platformsHasData) &&
                <Grid className={"platforms-grid"} data={this.props.platforms} size={PAGE_SIZE}
                      loading={platformsLoading} cols={gridCols} selectors={selectors}/>
                }
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        platforms: state.loadPlatformsSuccess,
        apiErrorPlatforms: state.loadPlatformsFailure,
        loadingPlatforms: state.loadPlatformsLoading,

        taxa: state.loadTaxaSuccess,
        apiErrorTaxa: state.loadTaxaFailure,
        loadingTaxa: state.loadTaxaLoading
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        fetchData: () => dispatch(loadPlatforms())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlatformsPage);
