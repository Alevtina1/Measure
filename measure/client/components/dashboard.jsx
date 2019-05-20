import React, { Component } from 'react';

class Dashboard extends Component {
  render () {
    const {
      setValue,
      acceptIterations,
      acceptSymbolicImage,
      prepareSymbolicImage,
      changePage,
      page,
      form,
    } = this.props;

    const iterContent = (
      <div className="dashboard__content">
        <div className="field">
          <label>
            Start X:
          </label>
          <input
            id="startX"
            value={form.startX}
            onChange={(e) => setValue('startX', e.target.value)}
          />
        </div>
        <div className="field">
          <label>
            End X:
          </label>
          <input
            id="endX"
            value={form.endX}
            onChange={(e) => setValue('endX', e.target.value)}
          />
        </div>
        <div className="field">
          <label>
            Step:
          </label>
          <input
            id="step"
            value={form.step}
            onChange={(e) => setValue('step', e.target.value)}
          />
        </div>
        <div className="field">
          <label>
            Iter number:
          </label>
          <input
            id="iterNumber"
            value={form.iterNumber}
            onChange={(e) => setValue('iterNumber', e.target.value)}
          />
        </div>
        <div className="field">
          <label>
            Scale:
          </label>
          <input
            id="scale"
            value={form.scale}
            onChange={(e) => setValue('scale', e.target.value)}
          />
        </div>
        <div>
          <label>
            Iter Functions:
          </label>
          <input
            id="iterX"
            value={form.iterX}
            placeholder="x"
            onChange={(e) => setValue('iterX', e.target.value)}
          />
          <input
            id="iterY"
            value={form.iterY}
            placeholder="y"
            onChange={(e) => setValue('iterY', e.target.value)}
          />
        </div>
        <div className="field">
          <label>
            x0:
          </label>
          <input
            id="x0"
            value={form.x0}
            onChange={(e) => setValue('x0', e.target.value)}
          />
        </div>
        <div className="field">
          <label>
            y0:
          </label>
          <input
            id="y0"
            value={form.y0}
            onChange={(e) => setValue('y0', e.target.value)}
          />
        </div>
        <label>
          Clear canvas
        </label>
        <input
          type="checkbox"
          checked={form.clear}
          onChange={(e) => setValue('clear', e.target.value)}
        />
        <input
          type="button"
          value="Iterations"
          onClick={() => acceptIteration(form)}
        />
        <input
          type="button"
          value="Eiler"
          onClick={() => this.props.acceptEiler(form)}
        />
        <input
          type="button"
          value="Runge-Kutta"
          onClick={() => this.props.acceptRk(form)}
        />
      </div>
    );

    const symbolContent = (
      <div className="dashboard__content">
        <div>
          <label>
            Functions:
          </label>
          <input
            id="symFunX"
            value={form.symFunX}
            placeholder="x"
            onChange={(e) => setValue('symFunX', e.target.value)}
          />
          <input
            id="symFunY"
            value={form.symFunY}
            placeholder="y"
            onChange={(e) => setValue('symFunY', e.target.value)}
          />
        </div>
        <div className="field">
          <label>
            Start X:
          </label>
          <input
            id="symStartX"
            value={form.symStartX}
            onChange={(e) => setValue('symStartX', e.target.value)}
          />
        </div>
        <div className="field">
          <label>
            Start Y:
          </label>
          <input
            id="symStartY"
            value={form.symStartY}
            onChange={(e) => setValue('symStartY', e.target.value)}
          />
        </div>
        <div className="field">
          <label>
            Grid width:
          </label>
          <input
            id="symGridWidth"
            value={form.symGridWidth}
            onChange={(e) => setValue('symGridWidth', e.target.value)}
          />
        </div>
        <div className="field">
          <label>
            Grid height:
          </label>
          <input
            id="symGridHeight"
            value={form.symGridHeight}
            onChange={(e) => setValue('symGridHeight', e.target.value)}
          />
        </div>
        <div className="field">
          <label>
            Grid delta:
          </label>
          <input
            id="symGridDelta"
            value={form.symGridDelta}
            onChange={(e) => setValue('symGridDelta', e.target.value)}
          />
        </div>
        <div className="field">
          <label>
            Dot number:
          </label>
          <input
            id="dotNumber"
            value={form.dotNumber}
            onChange={(e) => setValue('dotNumber', e.target.value)}
          />
        </div>
        <div className="field">
          <label>
            Iter number:
          </label>
          <input
            id="iterNumber"
            value={form.iterNumber}
            onChange={(e) => setValue('iterNumber', e.target.value)}
          />
        </div>
        <div className="field">
          <label>
            Scale:
          </label>
          <input
            id="scale"
            value={form.scale}
            onChange={(e) => setValue('scale', e.target.value)}
          />
        </div>
        <label>
          Clear canvas
        </label>
        <input
          type="checkbox"
          checked={form.clear}
          onChange={(e) => setValue('clear', !form.clear)}
        />
        <label>
          3D
        </label>
        <input
          type="checkbox"
          checked={form.sym3D}
          onChange={(e) => setValue('sym3D', !form.sym3D)}
        />
        <label>
          Frame mode
        </label>
        <input
          type="checkbox"
          checked={form.sym3D && form.symFrameMode}
          disabled={!form.sym3D}
          onChange={(e) => setValue('symFrameMode', !form.symFrameMode)}
        />
        <label>
          Balance method
        </label>
        <input
          type="checkbox"
          checked={form.balanceMethod}
          onChange={(e) => setValue('balanceMethod', !form.balanceMethod)}
        />
        <div className="field">
          <label>
            Flow min:
          </label>
          <input
            id="symFlowNormMin"
            value={form.symFlowNormMin}
            onChange={(e) => setValue('symFlowNormMin', e.target.value)}
          />
        </div>
        <div className="field">
          <label>
            Flow max:
          </label>
          <input
            id="symFlowNormMax"
            value={form.symFlowNormMax}
            onChange={(e) => setValue('symFlowNormMax', e.target.value)}
          />
        </div>
        <input
          type="button"
          value="Prepare"
          onClick={() => prepareSymbolicImage(form)}
        />
        <input
          type="button"
          value="Fetch"
          onClick={() => acceptSymbolicImage(form)}
        />
      </div>
    );

    return (
      <div className="dashboard">
        {
          page === 'symbol' ?
            symbolContent :
            page === 'iter' ?
              iterContent :
              null
        }
        {/* <div className="field">
          <label>
            Iter step:
          </label>
          <input
            id="iterStep"
            value={form.iterStep}
            onChange={this.changeState.bind(this)}
          />
        </div> */}
      </div>
    );
  }
}

export default Dashboard;
