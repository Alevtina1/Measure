import dashboardActions from '../actions/dashboard';

const { actionTypes } = dashboardActions;

const initialState = {
  page: 'symbol',
  form: {
    startX: 0,
    endX: 1000,
    step: 0.01,
    scale: 300,
    iterNumber: 1,
    iterX: 'y',
    iterY: '-0.25*y + 0.5*x*(1-x*x) + 0.5*cos(0.2*t)',
    x0: 0,
    y0: 0,
    dotNumber: 10,
    eilerFunc: 'x',
    iterStep: 0.1,
    symFunX: '0.6 + 0.9*(x*cos(0.4 - 6/(1+x*x+y*y)) - y*sin(0.4 - 6/(1+x*x+y*y)))',
    symFunY: '0.9*( x*sin(0.4 - 6/(1+x*x+y*y)) + y*cos(0.4 - 6/(1+x*x+y*y)))',
    symStartX: '-2',
    symStartY: '-2',
    symGridWidth: 2,
    symGridHeight: 2,
    symGridDelta: 2,
    symFlowNormMin: 0,
    symFlowNormMax: 1,
    symFrameMode: false,
    sym3D: false,
    showIds: false,
    clear: true,
    balanceMethod: false,
  },
};

const dashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_VALUE:
      return {
        ...state,
        form: {
          ...state.form,
          [action.field]: action.value,
        },
      };

    case actionTypes.CHANGE_PAGE:
      return {
        ...state,
        page: action.page,
      };

    default:
      return state;
  }
}

export default dashboardReducer;
