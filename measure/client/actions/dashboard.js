const config = {
  actionTypes: {
    SET_VALUE: 'SET_VALUE',
    CHANGE_PAGE: 'CHANGE_PAGE',
  },
};

class DashboardActions {
  constructor (config) {
    this.actionTypes = config.actionTypes;
  }

  setValue ({ field, value }) {
    return { type: this.actionTypes.SET_VALUE, field, value };
  }

  changePage (page) {
    return { type: this.actionTypes.CHANGE_PAGE, page };
  }
}

const dashboardActions = new DashboardActions(config);

export default dashboardActions;
