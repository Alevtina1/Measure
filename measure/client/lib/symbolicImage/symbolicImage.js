import { Parser } from 'expr-eval';
import _ from 'lodash';

import Graph from '../graph';

const parser = new Parser();

class SymbolicImage extends Graph {
  constructor (startX, startY, width, height, d, dotNumber, image) {
    super(width*height);

    this.final = true;

    this.secondaryImage = null;

    this.excluded = [];

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

    this.dotNumber = dotNumber;

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
    };
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

    if (x < this.startX || x > this.endX || y > this.endY || y < this.startY) {
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

  excludeNonReturnableItems () {
    this.excluded = [];
    this._findSCC();

    _.forEach(this.components, (component) => {
      if (component.length === 1) {
        this.excluded.push(component[0]);
      }
    });
  }
}

export default SymbolicImage;
