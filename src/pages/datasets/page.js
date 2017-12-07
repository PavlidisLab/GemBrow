import React from 'react';
import {connect} from 'react-redux';
import {loadDatasets} from "./actions";
import ErrorSquare from "../../common/components/errorSquare";
import FontAwesome from 'react-fontawesome'
import './style.css'
import Grid from "../../common/components/Grid/grid";
import LoadingCog from "../../common/components/LoadingCog";
import SubHeader from "../../common/components/subHeader";
import "react-toggle/style.css"

const TITLE = "Datasets overview"
const PAGE_SIZE = 20;

class DatasetsPage extends React.Component {

    componentDidMount() {
        this.props.fetchData();
    }

    render() {

        const error = this.props.apiError;
        const loading = this.props.loading;
        const hasData = this.props.datasets.length > 0;

        const header = loading
            ? <LoadingCog active={true} refreshing={hasData}/>
            : error && hasData
                ? <p><FontAwesome name='warning'/> Cached data</p>
                : undefined;

        const gridCols = {
            labels: ["Id", "Name", "Taxon", "Source", "Groups", "Tags"],
            data: ["shortName", "name", "taxon", "externalDatabase", "groups", "tags"],
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
                <Grid className="datasets-grid" data={this.props.datasets} size={PAGE_SIZE} loading={loading}
                      cols={gridCols}/>
                }
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        datasets: state.loadDatasetsSuccess,
        apiError: state.loadDatasetsFailure,
        loading: state.loadDatasetsLoading
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        fetchData: () => dispatch(loadDatasets())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(DatasetsPage);
