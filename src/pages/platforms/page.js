import React from 'react';
import ErrorSquare from "../../common/components/errorSquare";
import FontAwesome from 'react-fontawesome'
import PlatformRow from "./platformRow";
import './style.css'
import Grid from "../../common/components/Grid";
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

        const rows = this.props.platforms.map((item) => (<PlatformRow vo={item}/>));

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
                <Grid rows={rows} size={PAGE_SIZE} loading={loading && !hasData}/>
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
