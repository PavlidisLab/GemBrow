import React from 'react';
import ErrorSquare from "../../common/components/errorSquare";
import FontAwesome from 'react-fontawesome'
import './style.css'
import Grid from "../../common/components/Grid/grid";
import SubHeader from "../../common/components/subHeader";
import {loadPlatforms} from "./actions";
import {connect} from "react-redux";
import LoadingCog from "../../common/components/LoadingCog";

const TITLE = "Platforms overview"
const PAGE_SIZE = 20;

class PlatformsPage extends React.Component {

    componentDidMount() {
        this.props.fetchData();
    }

    render() {

        const error = this.props.apiError;
        const loading = this.props.loading;
        const hasData = this.props.platforms.length > 0;

        const header = loading
            ? <LoadingCog active={true} refreshing={hasData}/>
            : error && hasData
                ? <p><FontAwesome name='warning'/> Cached data</p>
                : undefined;

        const gridCols = {
            labels: ["Id", "Name", "Taxon", "Dataset count", "Tags", "Technology"],
            data: ["shortName", "name", "taxon", "expressionExperimentCount", "tags", "technology"],
            hideable: [false, true, true, true, true, true],
            hidden: [false, false, false, false, true, true]
        }

        return (
            <div>
                <SubHeader components={[header]} title={TITLE}/>
                <hr/>
                {error && !(loading || hasData) &&
                <div>
                    <ErrorSquare code={this.props.apiError.code} message={this.props.apiError.message}/>
                </div>
                }
                {(loading || hasData) &&
                <Grid className={"platforms-grid"} data={this.props.platforms} size={PAGE_SIZE} loading={loading} cols={gridCols}/>
                }
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        platforms: state.loadPlatformsSuccess,
        apiError: state.loadPlatformsFailure,
        loading: state.loadPlatformsLoading
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        fetchData: () => dispatch(loadPlatforms())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlatformsPage);
