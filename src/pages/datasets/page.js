import React from 'react';
import {connect} from 'react-redux';

import FontAwesome from 'react-fontawesome'
import 'react-toggle/style.css'
import './style.css'

import {loadDatasets} from './actions';
import ErrorSquare from '../../common/components/errorSquare/errorSquare';
import LoadingCog from '../../common/components/LoadingCog';
import SubHeader from '../../common/components/subHeader/subHeader';
import Grid from '../../common/components/grid/grid';
import TaxonSelector from "../../common/components/taxonSelector/taxonSelector";
import TroubledSelector from "../../common/components/troubledSelector/troubleSelector";
import TagSelector from "../../common/components/tagSelector/tagSelector";


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
            ? <LoadingCog active={true} refreshing={hasData} label="datasets"/>
            : error && hasData
                ? <p><FontAwesome name='warning'/> Cached datasets</p>
                : undefined;

        const gridCols = {
            labels: ["Id", "Name", "Taxon", "Source", "Groups", "Tags"],
            data: ["shortName", "name", "taxon", "externalDatabase", "groups", "tags"],
            hideable: [false, true, true, true, true, true],
            hidden: [false, false, false, false, true, true]
        }

        const selectors =
            <div className="dataset-selectors">
                <h4>Filters</h4>
                <TaxonSelector/>
                <TroubledSelector/>
                <TagSelector/>
            </div>;

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
                      cols={gridCols} selectors={selectors}/>
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
