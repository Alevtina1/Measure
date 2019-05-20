import { connect } from 'react-redux';

import Notification from '../lib/notification/notification';

const mapStateToProps = (state) => {
  const {
    visible,
    message,
    type,
  } = state.notification;

  return {
    visible,
    message,
    type,
  };
};

export default connect(mapStateToProps)(Notification);
