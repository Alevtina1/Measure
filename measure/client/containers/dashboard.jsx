import { connect } from 'react-redux';

import appActions from '../actions/app';
import dashboardActions from '../actions/dashboard';
import Dashboard from '../components/dashboard.jsx'

const mapStateToProps = (state) => {
  const {
    page,
    form,
  } = state.dashboard;

  return {
    form,
    page,
  };
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  acceptIterations: (form) => {
    dispatch(appActions.acceptIterations(form));
  },
  acceptSymbolicImage: (form) => {
    dispatch(appActions.acceptSymbolicImage(form));
  },
  prepareSymbolicImage: (form) => {
    dispatch(appActions.prepareSymbolicImage(form));
  },
  setValue: (field, value) => {
    dispatch(dashboardActions.setValue({ field, value }));
  },
  changePage: (page) => {
    dispatch(dashboardActions.changePage(page));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
