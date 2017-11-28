import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import Notifications from 'react-notification-system-redux';

class Notifier extends React.Component {

    render() {
        const {notifications} = this.props;

        const style = {
            Containers: {
                margin: '29px',
                fontFamily: ['Montserrat', 'sansSerif'],
                tr: {
                    top: '60px'
                }
            }
        }

        return (
            <div>
                <Notifications notifications={notifications} style={style}/>
            </div>
        );
    }
}

Notifier.contextTypes = {
    store: PropTypes.object
};

Notifier.propTypes = {
    notifications: PropTypes.array
};

export default connect(
    state => ({notifications: state.notifications})
)(Notifier);