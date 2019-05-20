import { Meteor } from 'meteor/meteor';
import SymbolicImage from '../lib/symbolicImage/symbolicImage';
import SubGraph from '../lib/subGraph';
import Matrix from '../lib/matrix';

class CanvasActions {
  constructor () {
    this.prepareSymbolicImage = this.prepareSymbolicImage.bind(this);
    this.createSymbolicImage = this.createSymbolicImage.bind(this);
  }

  createSymbolicImage (args) {
    return new Promise((resolve, reject) => {
      const label = Object.values(args).reduce((a, b) => a+JSON.stringify(b), '')
        .replace(' ', '');
      if (!this.images) {
        this.images = {};
      }

      this.images[label] = new SymbolicImage(
        args.gridX,
        args.gridY,
        args.gridW,
        args.gridH,
        args.gridD,
        args.dotNum,
        args.iterNumber,
        args.image,
        args.method,
      );


      setTimeout(() => this.prepareSymbolicImage(label), 1000);

      resolve('ok');
    });
  }

  prepareSymbolicImage (label) {
    this.images[label].calcImage();
    this.images[label].excludeNonReturnableItems();
    this.images[label].calcSecondary();

    // this.images[label].final ? this.images[label].generateProjectiveImages() : this.images[label].secondaryImage.generateProjectiveImages();

    // const combinedImage = this.images[label].final ? {} : this.images[label].secondaryImage.getCombinedImage();
    //
    // console.log(combinedImage.items);

    this.images[label].final ? null : this.images[label].secondaryImage.generateNeighbours();

    this.images[label].final ? this.images[label].applyWeightFunc() : this.images[label].secondaryImage.applyWeightFunc();

    // console.log(`EXTREMAL: `, this.images[label].final ? this.images[label].findOverallMMC() : this.images[label].secondaryImage.findOverallMMC());

    this.images[label].final ? this.images[label].colorize() : this.images[label].secondaryImage.colorize();

    if (this.images[label].final) {
      this.images[label].calculateFlow();
    } else {
      if (this.images[label].method === 'balance') {
        this.images[label].secondaryImage.calculateFlowBalance();
      } else {
        this.images[label].secondaryImage.calculateFlow();
      }
    }

    // const matrix = new Matrix(this.images[label].getRelationsMatrix());
    // console.log('MAX SELF VALUE: ', matrix.getMaxSelfValue(100));
    console.log('ITEMS NUMBER: ', this.images[label].final ? this.images[label].restItems.length : this.images[label].secondaryImage.restItems.length);
    console.log('COMPONENTS NUMBER: ', this.images[label].final ? this.images[label].restComponents.length : this.images[label].secondaryImage.restComponents.length);

    console.log('IMAGE PREPARED: ', label);
  }

  getSymbolicImage (args) {
    return new Promise((resolve, reject) => {
      const label = Object.values(args).reduce((a, b) => a+JSON.stringify(b), '')
        .replace(' ', '');
      console.log('FETCHED SYMBOLIC IMAGE: ', label);
      resolve(this.images[label]);
    })
    .catch((e) => console.log(e));
  }
}

const canvasAction = new CanvasActions();

Meteor.methods({
  'CanvasActions.getSymbolicImage': (args) => canvasAction.getSymbolicImage(args),
  'CanvasActions.createSymbolicImage': (args) => canvasAction.createSymbolicImage(args),
});

export default canvasAction;
