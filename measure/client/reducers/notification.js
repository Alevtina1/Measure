import  { NOTIFICATION_ACTIONS } from '../actions/actionTypes';

const {
  NOTIFICATION,
  HIDE_NOTIFICATION,
} = NOTIFICATION_ACTIONS;

const initialState = {
  visible: false,
  message: '',
  type: '',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case NOTIFICATION:
      return {
        ...state,
        visible: true,
        message: action.message || 'UNKNOWN MESSAGE',
        type: action.kind || '',
      };

    case HIDE_NOTIFICATION:
      return {
        ...state,
        visible: false,
      };

    default:
      return state;
  }
};
