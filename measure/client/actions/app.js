import notification from './notification';

const config = {
  actionTypes: {
    DRAWED: 'DRAWED',
    SUCCESS_ITERATION: 'SUCCESS_ITERATION',
    SUCCESS_SYMBOLIC_IMAGE: 'SUCCESS_SYMBOLIC_IMAGE',
    SET_VALUE: 'SET_VALUE',
  },
};

class AppActions {
  constructor (config) {
    this.actionTypes = config.actionTypes;
  }

  drawed () {
    return (dispatch) => {
      dispatch(notification.hide());
      dispatch(this.setDrawed());
    };
  }

  acceptIterations (data) {
    return (dispatch) => {
      dispatch(notification.loading());

      Meteor.call('CanvasActions.getIterations', data, (err, res) => {
        if (err) {
          dispatch(notification.alert(err.message || err.reason));
          return;
        }
        dispatch(notification.drawing());
        dispatch(this.successIteration(res));
      });
    }
  }

  acceptSymbolicImage (data) {
    return (dispatch) => {
      const args = {
        gridX: parseFloat(data.symStartX),
        gridY: parseFloat(data.symStartY),
        gridW: parseInt(data.symGridWidth),
        gridH: parseInt(data.symGridHeight),
        gridD: parseFloat(data.symGridDelta),
        iterNumber: parseInt(data.iterNumber),
        dotNum: parseInt(data.dotNumber),
        method: data.balanceMethod ? 'balance' : 'entropy',
        image: {
          x: data.symFunX,
          y: data.symFunY,
        },
      };

      Meteor.call('CanvasActions.getSymbolicImage', args, (err,res) => {
        if (err) {
          dispatch(notification.alert(err.message || err.reason));
          return;
        }
        if (res) {
          dispatch(notification.drawing());
          setTimeout(() => dispatch(this.successSymbolicImage(res)), 100);
        } else {
          dispatch(notification.alert('Cache not found'));
        }
      });
    }
  }

  prepareSymbolicImage (data) {
    return (dispatch) => {
      const args = {
        gridX: parseFloat(data.symStartX),
        gridY: parseFloat(data.symStartY),
        gridW: parseInt(data.symGridWidth),
        gridH: parseInt(data.symGridHeight),
        gridD: parseFloat(data.symGridDelta),
        iterNumber: parseInt(data.iterNumber),
        dotNum: parseInt(data.dotNumber),
        method: data.balanceMethod ? 'balance' : 'entropy',
        image: {
          x: data.symFunX,
          y: data.symFunY,
        },
      };
      console.log(args);

      dispatch(this.setValue({ field: 'scale', value: data.scale }));
      dispatch(this.setValue({ field: 'clear', value: data.clear }));

      dispatch(notification.loading());

      Meteor.call('CanvasActions.createSymbolicImage', args, (err,res) => {
        if (err) {
          dispatch(notification.alert(err.message || err.reason));
          return;
        }
        dispatch(notification.success('Success'));
      });
    }
  }

  setDrawed () {
    return { type: this.actionTypes.DRAWED };
  }

  successIteration (data) {
    return { type: this.actionTypes.SUCCESS_ITERATION, data };
  }

  successSymbolicImage (data) {
    return { type: this.actionTypes.SUCCESS_SYMBOLIC_IMAGE, data };
  }

  setValue ({ field, value }) {
    return { type: this.actionTypes.SET_VALUE, field, value };
  }
}

const appActions = new AppActions(config);

export default appActions;
