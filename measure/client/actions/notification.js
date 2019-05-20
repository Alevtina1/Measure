import { NOTIFICATION_ACTIONS } from './actionTypes.js';

const {
  NOTIFICATION,
  HIDE_NOTIFICATION,
} = NOTIFICATION_ACTIONS;

const DEFAULT_TIMEOUT = 5000;
const SHORT_TIMEOUT = 2000;

class NotificationActions {
  loading () {
    return (dispatch) => {
      dispatch(this.simple({ message: 'loading...', timeout: 0 }));
    };
  }

  drawing () {
    return (dispatch) => {
      dispatch(this.simple({ message: 'drawing...', kind: 'info', timeout: 0 }));
    };
  }

  alert (message) {
    return (dispatch) => {
      dispatch(this.simple({ message, kind: 'alert', timeout: DEFAULT_TIMEOUT }));
    };
  }

  info (message) {
    return (dispatch) => {
      dispatch(this.simple({ message, kind: 'info', timeout: DEFAULT_TIMEOUT }));
    };
  }

  success (message) {
    return (dispatch) => {
      dispatch(this.simple({ message, kind: 'success', timeout: SHORT_TIMEOUT }));
    };
  }

  simple ({ message, kind, timeout }) {
    return (dispatch) => {
      dispatch(this.show({ message, kind }));

      const showTimeout = (typeof timeout === 'number') ? timeout : DEFAULT_TIMEOUT;
      if (showTimeout) {
        setTimeout(() => {
          dispatch(this.hide());
        }, showTimeout);
      }
    };
  }

  show ({ message, kind }) {
    return ({ type: NOTIFICATION, message, kind });
  }

  hide () {
    return ({ type: HIDE_NOTIFICATION });
  }
}

export default new NotificationActions;
