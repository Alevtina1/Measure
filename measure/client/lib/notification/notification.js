import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './notification.styl';

class Notification extends Component {
  render () {
    const {
      type,
      message,
      visible,
    } = this.props;

    return (
      <div
        className={
          classNames(
            'notification__block',
            { [`-${type}`]: type },
            { '-visible': visible }
          )
        }
      >
        <div
          className={
            classNames(
              "notification__block-message",
              { [`-${type}`]: type }
            )
          }
        >
          {message}
        </div>
      </div>
    );
  }
}

Notification.displayName = 'Notification';

Notification.propTypes = {
  visible: PropTypes.bool,
  message: PropTypes.string,
  type: PropTypes.string,
};

export default Notification;
