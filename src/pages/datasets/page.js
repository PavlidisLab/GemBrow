import React from 'react';
import {connect} from 'react-redux';
import {loadDatasets} from "./actions";
import ErrorSquare from "../../common/components/errorSquare";
import DatasetRow from "./datasetRow";
import FontAwesome from 'react-fontawesome'
import './style.css'

class DatasetsPage extends React.Component {

    componentDidMount() {
        this.props.fetchData();
    }

    render() {

        if (this.props.loading) {
            return <p>Loading...</p>
        }

        if (this.props.apiError && this.props.datasets.length === 0) {
            return (
                <ErrorSquare code={this.props.apiError.code} message={this.props.apiError.message}/>
            )
        }

        const hasError = this.props.apiError;
        return (
            <div>
                {
                    hasError &&
                    <p><FontAwesome name='warning'/> Cached data</p>
                }
                <ul>
                    {this.props.datasets.map((item) => (
                        <DatasetRow vo={item}/>
                    ))}
                </ul>
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
