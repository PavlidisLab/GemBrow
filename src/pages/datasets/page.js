import React from 'react';
import {connect} from 'react-redux';
import {loadDatasets} from "./actions";
import ErrorSquare from "../../common/components/errorSquare";
import DatasetRow from "./datasetRow";
import FontAwesome from 'react-fontawesome'
import './style.css'
import Grid from "../../common/components/Grid";
import LoadingCog from "../../common/components/LoadingCog";
import SubHeader from "../../common/components/subHeader";

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

        const rows = this.props.datasets.map((item) => (<DatasetRow vo={item}/>));

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
                <Grid rows={rows} size={PAGE_SIZE} loading={loading}/>
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
