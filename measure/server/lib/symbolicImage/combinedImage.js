import _ from 'lodash';

import Graph from '../graph';

import config from './config.json';

class CombinedImage extends Graph {
  constructor (items, image) {
    const size = items.length *
      items[0].projectiveImage.size;

    super(size);

    this.dotImage = image;
    this.generateItems(items);
  }

  generateItems (items) {
    const dAngle = 2*Math.PI/config.sectorCount;
    this.items = [];
    this.vectorImages = [];

    _.forEach(items, (item, index) => {
      this.vectorImages.push(item.projectiveImage.image);

      for (let i = 0; i < config.sectorCount; i++) {
        this.items.push({
          id: index*config.sectorCount + i,
          startX: item.startX,
          endX: item.endX,
          startY: item.startY,
          endY: item.endY,
          startAngle: i*dAngle,
          endAngle: (i+1)*dAngle,
        });
      }
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

  calcImage () {
    _.forEach(this.items, (item) => {
      this.calcImageForItem(item);
    });
  }
}

export default CombinedImage;
