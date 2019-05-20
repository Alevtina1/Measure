import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Parser } from 'expr-eval';

import Canvas from './canvas';
import Dashboard from '../containers/dashboard';
import Notification from '../containers/notification';

const parser = new Parser();

const DEFAULT_CONFIG = {
  x0: 0.1,
  y0: 0.1,
  startX: -5,
  endX: 5,
  step: 0.001,
  iterNumber: 1,
  scale: 1,
  fun: (x) => x,
};

function getIterations (config) {
  const dots = [];
  let dot = {};
  let x = config.x0;
  let y = config.y0;

  for (let i = 0; i <= config.iterNumber; i++) {
    dots.push({ x, y });

    dot = getDotIteration(1, { x, y }, config.iterFun);
    x = dot.x;
    y = dot.y;
  }

  return dots;
}

function forEiler (x, y) {
  return x - y*y*Math.sin(x);
}

class App extends Component {
  iteration (dot) {
    const { x, y } = dot;

    return {
      x: this.props.iterConfig.iterX.evaluate({ x, y }),
      y: this.props.iterConfig.iterY.evaluate({ x, y }),
    };
  }

  getDotIteration (n, dot, iterFunction) {
    let iterDot = dot;
    let iterNumber = 0;

    while (iterNumber !== n) {
      iterDot = iterFunction(iterDot);
      iterNumber += 1;
    }

    return iterDot;
  }

  getFunctionDots () {
    const dots = [];
    let dot = {};
    let config = this.props.iterConfig;
    let X = config.startX;

    while (X < config.endX) {
      dot = {
        x: X,
        y: config.fun.evaluate({ x: X }),
      };
      dot = this.getDotIteration(config.iterNumber, dot, this.iteration.bind(this));

      dots.push(dot);

      X += config.step;
    }

    return dots;
  }

  acceptIteration (form) {
    this.setState((state) => {
      console.log('ITERATION: ', {
        iterConfig: {
          ...state.iterConfig,
          ...form,
        },
      });
      return {
        drawed: false,
        eiler: false,
        rk: false,
        clear: form.clear,
        canvasConfig: {
          ...state.canvasConfig,
          scale: parseInt(form.scale),
        },
        iterConfig: {
          ...state.iterConfig,
          startX: parseFloat(form.startX),
          scale: parseInt(form.scale),
          endX: parseFloat(form.endX),
          step: parseFloat(form.step),
          iterNumber: parseInt(form.iterNumber),
          iterX: parser.parse(form.iterX),
          iterY: parser.parse(form.iterY),
          fun: parser.parse(form.eilerFunc),
        },
        symbolicImage: null,
      }
    });
  }

  acceptEiler (form) {
    this.setState((state) => {
      return {
        drawed: false,
        eiler: true,
        rk: false,
        clear: form.clear,
        canvasConfig: {
          ...state.canvasConfig,
          scale: parseInt(form.scale),
        },
        eilerConfig: {
          ...state.eilerConfig,
          x0: parseFloat(form.x0),
          y0: parseFloat(form.y0),
          dotNumber: parseInt(form.dotNumber),
          iterNumber: parseInt(form.iterNumber),
          iterStep: parseFloat(form.iterStep),
          step: parseFloat(form.step),
          funX: parser.parse(form.iterX),
          funY: parser.parse(form.iterY),
          startX: parseFloat(form.startX),
          endX: parseFloat(form.endX),
        },
        symbolicImage: null,
      }
    });
  }

  acceptRk (form) {
    this.setState((state) => {
      return {
        drawed: false,
        eiler: false,
        rk: true,
        clear: form.clear,
        canvasConfig: {
          ...state.canvasConfig,
          scale: parseInt(form.scale),
        },
        eilerConfig: {
          ...state.eilerConfig,
          x0: parseFloat(form.x0),
          y0: parseFloat(form.y0),
          dotNumber: parseInt(form.dotNumber),
          iterNumber: parseInt(form.iterNumber),
          iterStep: parseFloat(form.iterStep),
          step: parseFloat(form.step),
          funX: parser.parse(form.iterX),
          funY: parser.parse(form.iterY),
          startX: parseFloat(form.startX),
          endX: parseFloat(form.endX),
        },
        symbolicImage: null,
      }
    });
  }

  acceptSymbolicImage (form) {
    const args = {
      gridX: parseFloat(form.symStartX),
      gridY: parseFloat(form.symStartY),
      gridW: parseInt(form.symGridWidth),
      gridH: parseInt(form.symGridHeight),
      gridD: parseFloat(form.symGridDelta),
      dotNum: parseInt(form.dotNumber),
      image: {
        x: form.symFunX,
        y: form.symFunY,
      },
    };

    Meteor.call('getSymbolicImage', args, (err, res) => {
      this.setState((state) => {
        return {
          drawed: false,
          eiler: false,
          rk: false,
          clear: form.clear,
          canvasConfig: {
            ...state.canvasConfig,
            scale: parseInt(form.scale),
          },
          eilerConfig: {
            ...state.eilerConfig,
            x0: parseFloat(form.x0),
            y0: parseFloat(form.y0),
            dotNumber: parseInt(form.dotNumber),
            iterNumber: parseInt(form.iterNumber),
            iterStep: parseFloat(form.iterStep),
            step: parseFloat(form.step),
            funX: parser.parse(form.iterX),
            funY: parser.parse(form.iterY),
            startX: parseFloat(form.startX),
            endX: parseFloat(form.endX),
          },
          symbolicImage: res,
        };
      });
    });
  }

  allowInput () {
    this.setState((state) => ({
      drawed: true,
    }));
  }

  render () {
    const {
      drawed,
      eiler,
      rk,
      clear,
      iterConfig,
      eilerConfig,
      symbolicImage,
      drawedCB,
      scale,
      sym3D,
      showIds,
      symFlowNormMax,
      symFlowNormMin,
      symFrameMode,
    } = this.props;

    const dots = this.getFunctionDots();

    return (
      <div className="app">
        <Notification />
        <Dashboard
          acceptEiler={this.acceptEiler.bind(this)}
          acceptRk={this.acceptRk.bind(this)}
        />
        <Canvas
          dots={dots}
          config={{ scale }}
          drawed={drawed}
          drawedCb={drawedCB}
          eiler={eiler}
          rk={rk}
          clear={clear}
          sym3D={sym3D}
          showIds={showIds}
          symFrameMode={symFrameMode}
          symFlowNormMax={parseFloat(symFlowNormMax)}
          symFlowNormMin={parseFloat(symFlowNormMin)}
          rkConfig={eilerConfig}
          eilerConfig={eilerConfig}
          symbolicImage={symbolicImage}
        />
      </div>
    );
  }
}

export default App;
