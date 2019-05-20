import React, { Component } from 'react';
import Canvas3D from './canvas3d.js';
import _ from 'lodash';


class Canvas extends Component {
  constructor (props) {
    super(props);
  }

  axisDraw () {
    const canvas = document.getElementById('main-screen');
    const ctx = canvas.getContext('2d');
    const {
      width,
      height,
    } = canvas;

    ctx.moveTo(width/2, 0);
    ctx.lineTo(width/2, height);
    ctx.moveTo(0, height/2);
    ctx.lineTo(width, height/2);
    ctx.stroke();
  }

  clear () {
    const canvas = document.getElementById('main-screen');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
  }

  shiftCenter (dots) {
    const canvas = document.getElementById('main-screen');
    const scale = this.props.config.scale ? this.props.config.scale : 1;
    const {
      width,
      height,
    } = canvas;

    return dots.map((dot) => ({
      x: scale*dot.x + width/2,
      y: height/2 - scale*dot.y,
    }));
  }

  drawLines (dots) {
    const canvas = document.getElementById('main-screen');
    const ctx = canvas.getContext('2d');

    ctx.beginPath();

    dots.forEach((dot, index) => {
      if (index % 2 === 0) {
        ctx.moveTo(dot.x, dot.y);
        ctx.lineTo(dots[index+1].x, dots[index+1].y);
      }
    });

    ctx.stroke();
    ctx.beginPath();
  }

  drawRect (x, y, width, height, color) {
    const canvas = document.getElementById('main-screen');
    const ctx = canvas.getContext('2d');
    const scale = this.props.config.scale ? this.props.config.scale : 1;
    const start = this.shiftCenter([{ x, y }])[0];

    if (color) {
      ctx.fillStyle = color;
    }

    ctx.fillRect(start.x, start.y, width*scale, height*scale);
  }

  drawText (x, y, text) {
    const canvas = document.getElementById('main-screen');
    const ctx = canvas.getContext('2d');
    const start = this.shiftCenter([{ x, y }])[0];
    ctx.font = '10px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(text, start.x, start.y);
  }

  drawDots (dots) {
    const canvas = document.getElementById('main-screen');
    const ctx = canvas.getContext('2d');

    dots.forEach((dot) => {
      ctx.fillRect(dot.x, dot.y, 1, 1);
    });
  }

  drawGrid (image) {
    const dots = [];

    for (let i = 0; i <= image.width; i++) {
      const currentX = image.startX + i*image.d;
      dots.push({ x: currentX, y: image.startY });
      dots.push({ x: currentX, y: image.endY });
    }

    for (let i = 0; i <= image.height; i++) {
      const currentY = image.startY + i*image.d;
      dots.push({ x: image.startX, y: currentY });
      dots.push({ x: image.endX, y: currentY });
    }

    this.drawLines(this.shiftCenter(dots));
  }

  drawEiler (config) {
    const canvas = document.getElementById('main-screen');
    const ctx = canvas.getContext('2d');
    const dots = [];
    const {
      x0,
      y0,
      fun,
      dotNumber,
      step,
    } = config;

    for (let m = 0; m <= config.iterNumber; m++) {
      for (let n = 0; n <= config.iterNumber; n++) {
        let x = x0 + m*config.iterStep;
        let y = y0 + n*config.iterStep;


        for (let i = config.startX; i <= config.endX; i+=config.step) {
          dots.push({ x, y });

          x += step*config.funX.evaluate({ x, y, t: i });
          y += step*config.funY.evaluate({ x, y, t: i });
        }

        dots.push({ x, y });
      }
    }


    this.drawDots(this.shiftCenter(dots));
  }

  drawRK (config) {
    const canvas = document.getElementById('main-screen');
    const ctx = canvas.getContext('2d');
    const dots = [];
    const {
      x0,
      y0,
      fun,
      dotNumber,
      step,
    } = config;

    for (let m = 0; m <= config.iterNumber; m++) {
      for (let n = 0; n <= config.iterNumber; n++) {
        let x = x0 + m*config.iterStep;
        let y = y0 + n*config.iterStep;
        let k1, k2, k3, k4, m1, m2, m3, m4;


        for (let t = config.startX; t <= config.endX; t+=step) {
          dots.push({ x, y });

          k1 = config.funY.evaluate({ x, y, t });
          k2 = config.funY.evaluate({ x: x + step/2, y: y + step*k1/2, t });
          k3 = config.funY.evaluate({ x: x + step/2, y: y + step*k2/2, t });
          k4 = config.funY.evaluate({ x: x + step, y: y + step*k3, t });

          m1 = config.funX.evaluate({ x, y, t });
          m2 = config.funX.evaluate({ x: x + step/2, y: y + step*m1/2, t });
          m3 = config.funX.evaluate({ x: x + step/2, y: y + step*m2/2, t });
          m4 = config.funX.evaluate({ x: x + step, y: y + step*m3, t });

          y += step*(k1 + 2*k2 + 2*k3 + k4)/6;
          x += step*(m1 + 2*m2 + 2*m3 + m4)/6;
        }

        dots.push({ x, y });
      }
    }

    this.drawDots(this.shiftCenter(dots));
  }

  symbolicImageNormalizeFlow (symbolicImage, min=1, max=5) {
    if (!symbolicImage.flows) {
      return;
    }
    const flows = Object.values(symbolicImage.flows);
    const minFlow = Math.min(...flows);
    const maxFlow = Math.max(...flows);

    console.log(`Flow normalization: (${minFlow}, ${maxFlow}) => (${min}, ${max})`);

    symbolicImage.normalizedFlows = {};

    _.forEach(symbolicImage.flows, (flow, index) => {
      symbolicImage.normalizedFlows[index] = (max - min)*(flow - minFlow)/(maxFlow - minFlow) + min;
    });
  }

  async drawSymbolicImage (symbolicImage) {
    let scaleColor;
    let drawedCount = 0;
    const itemSize = symbolicImage.final ? symbolicImage.d : symbolicImage.secondaryImage.d;
    const items = symbolicImage.final ? symbolicImage.colorizedItems : symbolicImage.secondaryImage.colorizedItems;
    const toDrawCount = items.length;

    if (this.canvas3d) {
      this.canvas3d.unmount();
      delete this.canvas3d;
    }
    if (this.props.sym3D) {
      this.canvas3d = new Canvas3D('#main-sreen');
      symbolicImage.final
        ? this.symbolicImageNormalizeFlow(symbolicImage, this.props.symFlowNormMin, this.props.symFlowNormMax)
        : this.symbolicImageNormalizeFlow(symbolicImage.secondaryImage, this.props.symFlowNormMin, this.props.symFlowNormMax);
      this.canvas3d.mount();
      this.canvas3d.renderSymbolicImage(symbolicImage, this.props.symFrameMode);
      return;
    }

    //this.drawGrid(symbolicImage);
    console.log(symbolicImage);
    console.log('IMAGE SIZE: ', toDrawCount);

    _.forEach(items, (item) => {
      if (!symbolicImage.excluded.includes(item.item.id)) {
        this.drawRect(item.item.startX, item.item.endY, itemSize, itemSize, item.color);
        if (item.item.projectiveImage) {
          this.drawProjectiveImage(item.item.projectiveImage, itemSize);
        }
        if (this.props.showIds) {
          this.drawText(item.item.startX+itemSize/2, item.item.startY+itemSize/2, `${item.item.id}`);
        }
        drawedCount += 1;
        if (drawedCount % 100 === 0) {
          console.log(`DRAWED: ${drawedCount}/${toDrawCount}`);
        }
      }
    });
  }

  drawProjectiveImage (image, radius) {
    const canvas = document.getElementById('main-screen');
    const ctx = canvas.getContext('2d');
    const scale = this.props.config.scale ? this.props.config.scale : 1;
    const start = this.shiftCenter([{ x: image.dot.x, y: image.dot.y }])[0];

    ctx.fillStyle = '#333333';

    console.log(start, radius);
    image.restItems.forEach((item) => {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.arc(start.x, start.y, radius*scale/2, item.startAngle, item.endAngle);
      ctx.lineTo(start.x, start.y);
      ctx.fill();
      ctx.beginPath();
    });
  }

  componentDidUpdate () {
    if (!this.props.drawed) {
      console.log('CANVAS UPDATED');
      console.log('3D', this.props.sym3D);
      if (this.props.clear || true) {
        console.log('clear!!!!!!!!!!!');
        this.clear();
        this.axisDraw();
      }
      if (this.props.eiler) {
        console.log('EILER ACTIVATED');
        this.drawEiler(this.props.eilerConfig);
      } else if (this.props.rk) {
        console.log('RUNGE-KUTTA ACTIVATED');
        this.drawRK(this.props.rkConfig);
      } else if (this.props.symbolicImage) {
        console.log('SYMBOLIC IMAGE');
        this.drawSymbolicImage(this.props.symbolicImage);
      } else {
        this.drawDots(this.shiftCenter(this.props.dots));
      }
      this.props.drawedCb();
    }
  }

  render () {
    return (
      <div className="canvas">
        <canvas
          id="main-screen"
          className="canvas-element"
          width={1350}
          height={887}
        />
      </div>
    );
  }
}

export default Canvas;
