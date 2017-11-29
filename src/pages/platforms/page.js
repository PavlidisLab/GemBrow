import React from 'react';
import {connect} from 'react-redux';
import {loadPlatforms} from "./actions";
import ErrorSquare from "../../common/components/errorSquare";

class PlatformsPage extends React.Component {

    componentDidMount() {
        this.props.fetchData();
    }

    render() {

        if (this.props.loading) {
            return <p>Loading...</p>
        }

        if (this.props.apiError) {
            return (
                <ErrorSquare code={this.props.apiError.code} message={this.props.apiError.message}/>
            )
        }

        return (
            <ul>
                {this.props.platforms.map((item) => (
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
