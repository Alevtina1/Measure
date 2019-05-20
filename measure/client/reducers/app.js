import { Parser } from 'expr-eval';

import appActions from '../actions/app';

const { actionTypes } = appActions;
const parser = new Parser();

const initialState = {
  drawed: true,
  eiler: false,
  rk: false,
  clear: false,
  scale: 1,
  iterConfig: {
    x0: 0.1,
    y0: 0.1,
    startX: -5,
    endX: 5,
    step: 0.01,
    iterNumber: 2,
    scale: 1,
    iterX: parser.parse('x'),
    iterY: parser.parse('y'),
    fun: parser.parse('x'),
  },
  eilerConfig: {
    x0: -10,
    y0: 20,
    step: 0.0001,
    dotNumber: 500000,
  },
  symbolicImage: null,
};

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SUCCESS_SYMBOLIC_IMAGE:
      return {
        ...state,
        drawed: false,
        eiler: false,
        rk: false,
        symbolicImage: action.data,
      };

    case actionTypes.DRAWED:
      return {
        ...state,
        drawed: true,
      };

    case actionTypes.SET_VALUE:
      return {
        ...state,
        [action.field]: action.value,
      };

    default:
      return state;
  }
};

export default appReducer;
