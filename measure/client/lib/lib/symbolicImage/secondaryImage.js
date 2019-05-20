import _ from 'lodash';
import hamsters from 'hamsters.js';
import randomColor from 'randomcolor';

import Graph from '../graph';

class SecondaryImage extends Graph {
  constructor (items, dotNumber, d, image) {
    super(4*items.length);

    this.startX = -99999;
    this.endX = 99999;

    this.startY = -99999;
    this.endY = 99999;

    this.excluded = [];

    this.image = image;

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

      this.items.push({
        id: index*4,
        startX: item.startX,
        endX: item.startX + this.d,
        startY: item.startY,
        endY: item.startY + this.d,
      });
      this.items.push({
        id: index*4 + 1,
        startX: item.startX,
        endX: item.startX + this.d,
        startY: item.startY + this.d,
        endY: item.startY + 2*this.d,
      });
      this.items.push({
        id: index*4 + 2,
        startX: item.startX + this.d,
        endX: item.startX + 2*this.d,
        startY: item.startY,
        endY: item.startY + this.d,
      });
      this.items.push({
        id: index*4 + 3,
        startX: item.startX + this.d,
        endX: item.startX + 2*this.d,
        startY: item.startY + this.d,
        endY: item.startY + 2*this.d,
      });
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

      if (item.startX < x && item.endX > x && item.startY < y && item.endY > y) {
        return item;
      }
    }
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
}

export default SecondaryImage;
