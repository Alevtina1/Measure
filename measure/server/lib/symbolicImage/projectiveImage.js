import { Parser } from 'expr-eval';
import randomColor from 'randomcolor';
import _ from 'lodash';

import Graph from '../graph';
import SubGraph from '../subGraph';

import Derivative from '../derivative';
import Matrix from '../matrix';

const parser = new Parser();

class ProjectiveImage extends Graph {
  constructor (itemX, itemY, sectorCount, vecNumber, image) {
    super(sectorCount);

    this.dot = { x: itemX, y: itemY };

    this.d = 2*Math.PI/sectorCount;

    const funSys = {
      x: new Derivative(image.x),
      y: new Derivative(image.y),
    };

    this.image = [
      [funSys.x.getBy('x', this.dot), funSys.x.getBy('y', this.dot)],
      [funSys.y.getBy('x', this.dot), funSys.y.getBy('y', this.dot)],
    ];

    this.vecNumber = vecNumber;

    this.vecItemDelta = this.d/(vecNumber + 1);

    this.items = [];

    for (let i = 0; i < this.size; i++) {
      this.items.push(this.generateItem(i));
    }

    this.calcImage();
    this.excludeNonReturnableItems();
  }

  generateItem (index) {
    const startAngle = index*this.d;
    const endAngle = startAngle + this.d;

    return {
      id: index,
      startAngle,
      endAngle,
    };
  }

  getItem (index) {
    return this.items[index];
  }

  angleToItem (angle) {
    return this.getItem(Math.floor(angle/this.d)%this.size);
  }

  calcImage () {
    _.forEach(this.items, (item) => {
      this.calcImageForItem(item, this.image);
    });
  }

  calcImageForItem (item, image) {
    const delta = this.vecItemDelta;
    const startAngle = item.startAngle + delta;
    let angle;
    let imageAngle;
    let imageVec;
    let imageItem;
    let vec;

    for (let i = 0; i < this.vecNumber; i++) {
      angle = startAngle + i*delta;
      vec = [Math.cos(angle), Math.sin(angle)];
      imageVec = [
        vec[0]*this.image[0][0] + vec[1]*this.image[0][1],
        vec[0]*this.image[1][0] + vec[1]*this.image[1][1],
      ];
      imageAngle = Math.acos(imageVec[0]/(imageVec[0]*imageVec[0] + imageVec[1]*imageVec[1]));
      imageItem = this.angleToItem(imageAngle);

      if (imageItem) {
        this.addEdge(item.id, imageItem.id);
      }
    }
  }

  getRestComponentIndexByVertex (vertex) {
    for (let i = 0; i < this.restComponents.length; i++) {
      if (this.restComponents[i].includes(vertex)) {
        return i;
      }
    }
    return undefined;
  }

  excludeNonReturnableItems () {
    this.restComponents = [];
    this.restItems = [];
    this.excluded = [];
    this._findSCCIter();

    _.forEach(this.components, (component) => {
      if (component.length === 1 && !this.v[component[0]].includes(component[0])) {
        this.excluded.push(component[0]);
      } else {
        this.restComponents.push(component);
        component.forEach((index) => this.restItems.push(this.items[index]));
      }
    });
  }

  applyWeightFunc () {
    if (this.restItems && this.restItems.length) {
      this.weights = [];

      this.restItems = this.restItems.map((item) => {
        const funSys = this.weightFunc;
        const dot = { x: item.startX + this.d/2, y: item.startY + this.d/2 };
        const jac = new Matrix([
          [funSys.x.getBy('x', dot), funSys.x.getBy('y', dot)],
          [funSys.y.getBy('x', dot), funSys.y.getBy('y', dot)],
        ]);
        const weight = jac.selfValues2x2();

        this.weights[item.id] = weight;

        return {
          ...item,
          weight,
        };
      });
    }
  }

  findOverallMMC (single = true) {
    const result = { min: null, max: null };

    if (single) {
      let maxComponent = this.restComponents[0];
      let maxSize = this.restComponents[0].length;

      this.restComponents.forEach((component) => {
        if (component.length > maxSize) {
          maxSize = component.length;
          maxComponent = component;
        }
      });

      console.log(`SINGLE MMC: Component contains ${maxComponent.length} items`);

      const componentGraph = new SubGraph(this, maxComponent);
      this.mmc = componentGraph.findMMCValue();

      return this.mmc;
    }

    this.restComponents.forEach((component) => {
      console.log(`OVERALL MMC: Component ${index+1}/${componentsNumber} (${component.length})`);

      const componentGraph = new SubGraph(this, component);
      const mmc = componentGraph.findMMCValue();

      console.log(`OVERALL MMC STEP: ${JSON.stringify(mmc)}`);

      if (result.min === null) {
        result.min = mmc.min.value;
        result.max = mmc.max.value;
      } else {
        result.min = Math.min(mmc.min.value, result.min);
        result.max = Math.max(mmc.max.value, result.max);
      }
    });

    this.mmc = result;

    return result;
  }

  colorize () {
    if (!this.restComponents) {
      this.excludeNonReturnableItems();
    }

    const colors = _.map(this.restComponents, () => randomColor({ format: 'rgb' }));
    this.colorizedItems = _.map(this.restItems, (item) => ({
      item,
      color: colors[this.getRestComponentIndexByVertex(item.id)],
    }));
  }

  calculateFlow (single = true) {
    if (!single) {
      this.flows = {};

      this.restComponents.forEach((component, index) => {
        console.log(`Flow calculating: component: ${index}/${this.restComponents.length} size: (${component.length})`);
        const componentGraph = new SubGraph(this, component);
        const flowMatrix = componentGraph.getFlowMatrix(100);

        for (let i = 0; i < component.length; i++) {
          this.flows[component[i]] = flowMatrix.sumRow(i)/(this.d*this.d);
        }
      });

      this.normalizeFlow(1, 1.3);
      return;
    }

    let maxComponent = this.restComponents[0];
    let maxSize = this.restComponents[0].length;

    this.restComponents.forEach((component) => {
      if (component.length > maxSize) {
        maxSize = component.length;
        maxComponent = component;
      }
    });

    const componentGraph = new SubGraph(this, maxComponent);
    const flowMatrix = componentGraph.getFlowMatrix(100);

    this.flows = {};
    console.log(`Flow calculating: component size: ${maxComponent.length}`);
    for (let i = 0; i < maxComponent.length; i++) {
      this.flows[maxComponent[i]] = flowMatrix.sumRow(i)/(this.d*this.d);
    }

    this.normalizeFlow(1, 1.3);
  }

  normalizeFlow (min=1, max=5) {
    const flows = Object.values(this.flows);
    const minFlow = Math.min(...flows);
    const maxFlow = Math.max(...flows);

    console.log(`Flow normalization: (${minFlow}, ${maxFlow}) => (${min}, ${max})`);

    this.normalizedFlows = {};

    _.forEach(this.flows, (flow, index) => {
      this.normalizedFlows[index] = (max - min)*(flow - minFlow)/(maxFlow - minFlow) + min;
    });
  }
}

export default ProjectiveImage;
