import { Parser } from 'expr-eval';
import randomColor from 'randomcolor';
import _ from 'lodash';

import Graph from '../graph';
import SubGraph from '../subGraph';

import Derivative from '../derivative';
import Matrix from '../matrix';

import SecondaryImage from './secondaryImage';
import ProjectiveImage from './projectiveImage';

import config from './config.json';

const parser = new Parser();

class SymbolicImage extends Graph {
  constructor (startX, startY, width, height, d, dotNumber, iterNumber, image, method) {
    super(width*height);

    this.final = true;

    this.secondaryImage = null;

    this.excluded = [];
    this.weights = [];

    this.method = method;
    this.width = width;
    this.height = height;

    this.startX = startX;
    this.endX = startX + width*d;

    this.startY = startY;
    this.endY = startY + height*d;

    this.d = d;

    this.image = {
      x: parser.parse(image.x),
      y: parser.parse(image.y),
    };

    this.weightFunc = {
      x: new Derivative(image.x),
      y: new Derivative(image.y),
    };

    this.dotNumber = dotNumber;
    this.iterNumber = iterNumber;

    this.dotItemDelta = d/(dotNumber + 1);

    this.items = [];
    this.maxEntries = 0;

    for (let i = 0; i < this.size; i++) {
      this.items.push(this.generateItem(i));
    }

    this.calcImageForItem = this.calcImageForItem.bind(this);
    this.generateItem = this.generateItem.bind(this);
    this.calcImage = this.calcImage.bind(this);
    this.dotToItem = this.dotToItem.bind(this);
    this.getItem = this.getItem.bind(this);
  }

  generateItem (index) {
    const rowNumber = Math.floor(index/this.width);
    const colNumber = index % this.width;
    const startX = this.startX + colNumber*this.d;
    const startY = this.startY + rowNumber*this.d;

    return {
      id: index,
      entryCount: 0,
      startX,
      endX: startX + this.d,
      startY,
      endY: startY + this.d,
      neighbours: this.generateNeighbours(rowNumber, colNumber),
    };
  }

  generateProjectiveImages () {
    this.restItems.forEach((item) => {
      item.projectiveImage = new ProjectiveImage(
        item.startX + this.d/2,
        item.startY + this.d/2,
        config.sectorCount,
        config.vecNumber,
        this.image,
      );
    });
  }

  generateNeighbours (rowNumber, colNumber) {
    const neighbours = {};
    if (rowNumber !== 0) {
      neighbours.bottom = (rowNumber-1)*this.width + colNumber;
    }
    if (rowNumber !== this.height - 1) {
      neighbours.top = (rowNumber+1)*this.width + colNumber;
    }
    if (colNumber !== 0) {
      neighbours.left = rowNumber*this.width + colNumber - 1;
    }
    if (colNumber !== this.width - 1) {
      neighbours.right = rowNumber*this.width + colNumber + 1;
    }

    return neighbours;
  }

  getItem (index) {
    return this.items[index];
  }

  addEntry (index) {
    this.items[index].entryCount += 1;
    if (this.maxEntries < this.items[index].entryCount) {
      this.maxEntries = this.items[index].entryCount;
    }
  }

  dotToItem (x, y) {
    let foundX = this.startX + this.d;
    let foundY = this.startY + this.d;
    let foundRow = 0;
    let foundCol = 0;

    if (x < this.startX || x >= this.endX || y >= this.endY || y < this.startY) {
      return undefined;
    }

    while (foundX < this.endX) {
      if (x < foundX) {
        break;
      }
      foundX += this.d;
      foundCol += 1;
    }

    while (foundY < this.endY) {
      if (y < foundY) {
        break;
      }

      foundY += this.d;
      foundRow += 1;
    }

    return this.getItem(foundRow*this.width + foundCol);
  }

  calcImage () {
    _.forEach(this.items, (item) => {
      this.calcImageForItem(item, this.image);
    });
  }

  calcImageForItem (item, image) {
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
        imageX = image.x.evaluate({ x, y });
        imageY = image.y.evaluate({ x, y });
        imageItem = this.dotToItem(imageX, imageY);

        if (imageItem) {
          this.addEdge(item.id, imageItem.id);
          this.addEntry(imageItem.id);
        }
      }
    }
  }

  calcSecondary () {
    for (let i = 0; i < this.iterNumber; i++) {
      this.final = false;
      if (i === 0) {
        this.secondaryImage = new SecondaryImage(
          this.restItems,
          this.dotNumber,
          this.d/2,
          this.image,
          this.weightFunc
        );
      } else {
        this.secondaryImage = new SecondaryImage(
          this.secondaryImage.restItems,
          this.secondaryImage.dotNumber,
          this.secondaryImage.d/2,
          this.image,
          this.weightFunc
        );
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
    console.log(componentGraph.v);
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

export default SymbolicImage;
