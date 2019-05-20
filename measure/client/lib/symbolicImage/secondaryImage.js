import _ from 'lodash';

import Graph from '../graph';

class SecondaryImage extends Graph {
  constructor (items) {
    this.items = [];
    this.calcItemsSize(items);
    this.generateNewItems(items);

    super(items.length);
  }

  calcItemsSize () {
    const item = items[0];

    this.d = item.startX + (item.endX - item.startX)/2;
  }

  generateNewItems (items) {
    _.forEach(items, (item) => {
      this.items.push({
        id: this.items.length,
        startX: item.startX,
        endX: item.startX + this.d,
        startY: item.startY,
        endY: item.startY + this.d,
      });
      this.items.push({
        id: this.items.length,
        startX: item.startX,
        endX: item.startX + this.d,
        startY: item.startY + this.d,
        endY: item.startY + 2*this.d,
      });
      this.items.push({
        id: this.items.length,
        startX: item.startX + this.d,
        endX: item.startX + 2*this.d,
        startY: item.startY,
        endY: item.startY + this.d,
      });
      this.items.push({
        id: this.items.length,
        startX: item.startX + this.d,
        endX: item.startX + 2*this.d,
        startY: item.startY + this.d,
        endY: item.startY + 2*this.d,
      });
    });
  }
}
