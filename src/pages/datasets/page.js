import React from 'react';
import { connect } from 'react-redux';
import {loadDatasets} from "./actions";

class DatasetsPage extends React.Component {

    componentDidMount() {
        this.props.fetchData();
    }

    render() {

        if(this.props.loading){
            return <p>Loading...</p>
        }

        if(this.props.apiError){
            return (
                <div className="container alert-warning">
                    <p>{this.props.apiError.code}</p>
                    <p>{this.props.apiError.message}</p>
                </div>
            )
        }

        return (
            <ul>
                {this.props.datasets.map((item) => (
                    <li key={item.id}>
                        {item.name}
                    </li>
                ))}
            </ul>
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
