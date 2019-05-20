import { connect } from 'react-redux';

import appActions from '../actions/app';
import App from '../components/main';

const mapStateToProps = (state) => {
  const {
    drawed,
    eiler,
    rk,
    iterConfig,
    eilerConfig,
    symbolicImage,
    scale,
  } = state.app;
  const {
    clear,
    sym3D,
    showIds,
    symFlowNormMax,
    symFlowNormMin,
    symFrameMode,
  } = state.dashboard.form;

  return {
    drawed,
    eiler,
    rk,
    clear,
    sym3D,
    showIds,
    symFlowNormMax,
    symFlowNormMin,
    symFrameMode,
    iterConfig,
    eilerConfig,
    symbolicImage,
    scale,
  };
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  drawedCB: () => {
    dispatch(appActions.drawed());
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
