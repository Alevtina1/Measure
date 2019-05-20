import _ from 'lodash';
import hamsters from 'hamsters.js';
import randomColor from 'randomcolor';

import computeEigens from '../eigenHelper/starter.js';
import Graph from '../graph';
import SubGraph from '../subGraph';
import Matrix from  '../matrix';
import ReMatrix from '../reMatrix';
import ProjectiveImage from './projectiveImage';
import CombinedImage from './combinedImage';

import config from './config.json';

class SecondaryImage extends Graph {
  constructor (items, dotNumber, d, image, weightFunc) {
    super(4*items.length);

    this.startX = -Infinity;
    this.endX = Infinity;

    this.startY = -Infinity;
    this.endY = Infinity;

    this.excluded = [];

    this.weightFunc = weightFunc;
    this.image = image;

    this.weights = [];
    this.items = [];
    this.d = d;
    this.generateNewItems(items);

    this.dotNumber = dotNumber;

    this.dotItemDelta = d/(dotNumber + 1);

    this.calcImage();
    this.excludeNonReturnableItems();
  }

  generateNewItems (items) {
    _.forEach(items, (item, index) => {
      this.startX = Math.max(this.startX, item.startX);
      this.endX = Math.min(this.endX, item.endX);

      this.startY = Math.max(this.startY, item.startY);
      this.endY = Math.min(this.endY, item.endY);

      const indexes = this.getQuartIndexes(index);

      this.items.push({
        id: indexes.bottomLeft,
        startX: item.startX,
        endX: item.startX + this.d,
        startY: item.startY,
        endY: item.startY + this.d,
      });
      this.items.push({
        id: indexes.bottomRight,
        startX: item.startX + this.d,
        endX: item.startX + 2*this.d,
        startY: item.startY,
        endY: item.startY + this.d,
      });
      this.items.push({
        id: indexes.topLeft,
        startX: item.startX,
        endX: item.startX + this.d,
        startY: item.startY + this.d,
        endY: item.startY + 2*this.d,
      });
      this.items.push({
        id: indexes.topRight,
        startX: item.startX + this.d,
        endX: item.startX + 2*this.d,
        startY: item.startY + this.d,
        endY: item.startY + 2*this.d,
      });
    });
  }

  getCombinedImage () {
    return new CombinedImage(this.items);
  }

  generateProjectiveImages () {
    this.restItems.forEach((item, index) => {
      if (index % 1000 === 0) {
        console.log(`Projective image: item ${index}/${this.restItems.length}`);
      }

      item.projectiveImage = new ProjectiveImage(
        item.startX + this.d/2,
        item.startY + this.d/2,
        config.sectorCount,
        config.vecNumber,
        this.image,
      );
    });
  }

  getQuartIndexes (index) {
    return {
      topRight: index*4 + 3,
      topLeft: index*4 + 2,
      bottomRight: index*4 + 1,
      bottomLeft: index*4,
    };
  }

  generateNeighbours () {
    this.restItems = this.restItems.map((item) => {
      const centerX = item.startX + this.d/2;
      const centerY = item.startY + this.d/2;

      return {
        ...item,
        neighbours: {
          left: this.dotToRestItem(centerX - this.d, centerY),
          right: this.dotToRestItem(centerX + this.d, centerY),
          bottom: this.dotToRestItem(centerX, centerY - this.d),
          top: this.dotToRestItem(centerX, centerY + this.d),
        },
      };
    });
  }

  dotToItem (x, y) {
    // return new Promise((resolve, reject) => {
    //   const params = {
    //     items: this.items,
    //     x,
    //     y,
    //     threads: hamsters.maxThreads,
    //     aggregate: true,
    //   };
    //
    //   hamsters.promise(params, function () {
    //     params.items.forEach((item) => {
    //       if (item.startX < x && item.endX > x && item.startY < y && item.endY > y) {
    //         return rtn.data.push(item);
    //       }
    //     });
    //   }).then((res) => resolve(res.data[0]));
    // });

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];

      if (item.startX < x && item.endX >= x && item.startY < y && item.endY >= y) {
        return item;
      }
    }
  }

  dotToRestItem (x, y) {
    for (let i = 0; i < this.restItems.length; i++) {
      const item = this.restItems[i];

      if (item.startX < x && item.endX > x && item.startY < y && item.endY > y) {
        return item;
      }
    }
    return undefined;
  }

  calcImageForItem (item) {
    const delta = this.dotItemDelta;
    const startX = item.startX + delta;
    const startY = item.startY + delta;
    let x;
    let y;
    let imageX;
    let imageY;
    let imageItem;

    if (!(item.id % 1000)) {
      console.log(`Item image: ${item.id}/${this.size}`);
    }

    for (let i = 0; i < this.dotNumber; i++) {
      y = startY + i*delta;
      for (let j = 0; j < this.dotNumber; j++) {
        x = startX + j*delta;
        imageX = this.image.x.evaluate({ x, y });
        imageY = this.image.y.evaluate({ x, y });
        imageItem = this.dotToItem(imageX, imageY);

        if (imageItem) {
          this.addEdge(item.id, imageItem.id);
        }
      }
    }
  }

  calcImage () {
    _.forEach(this.items, (item) => {
      this.calcImageForItem(item);
    });
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

  findOverallMMC (single = false) {
    const result = { min: null, max: null };
    const componentsNumber = this.restComponents.length;

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

    this.restComponents.forEach((component, index) => {
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

      this.normalizeFlow(1, 1.5);
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

    computeEigens(componentGraph.v, ({ value, vector }) => {
      const relationsMatrix = componentGraph.getRelationsMatrix();
      const flowMatrix = new Matrix(relationsMatrix);
      for (let i = 0; i < relationsMatrix.length; i ++) {
        for (let j = 0; j < relationsMatrix.length; j ++) {
          flowMatrix.setItem(i, j, (relationsMatrix[i][j]*vector[j])/value);
        }
      }
      this.flows = {};
      console.log(`Flow calculating: component size: ${maxComponent.length}`);
      for (let i = 0; i < maxComponent.length; i++) {
        let flowValue = flowMatrix.sumRow(i)/(this.d*this.d);
        this.flows[maxComponent[i]] = flowValue > 100000 ? 1000 : flowValue;
      }

      this.normalizeFlow(1, 1.5);
    });
  }

  calculateFlowBalance (single = true) {
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

      this.normalizeFlow(1, 1.5);
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

    this.normalizeFlow(1, 1.5);
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

export default SecondaryImage;
