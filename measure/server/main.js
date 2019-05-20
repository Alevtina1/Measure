import { Meteor } from 'meteor/meteor';

import './actions/canvasActions';

import Graph from './lib/graph.js';
import Matrix from './lib/matrix.js';
import ReMatrix from './lib/reMatrix';


const m = new ReMatrix(3, 0);
m.setData([
  [1,0,1],
  [0,1,1],
  [1,1,1],
]);
const maxEigenVector = m.maxEigenVector(true)

console.log(maxEigenVector);
console.log(m.eigenValueByVector(maxEigenVector));

const matrix = new Matrix([
  [0,1,0,1,0,0],
  [0,0,1,0,0,0],
  [0,0,0,1,0,1],
  [0,0,0,0,1,0],
  [1,0,0,0,0,0],
  [1,0,0,0,0,0],
]);

console.log('MAX SELF VALUE(100): ', matrix.getMaxSelfValue());
console.log('MAX SELF VALUE(150): ', matrix.getMaxSelfValue(150));
console.log('MAX SELF VALUE(200): ', matrix.getMaxSelfValue(200));

// GRAPH TEST
// const g = new Graph(6);
//
// g.applyRelationsMatrix([
//   [0,1,0,1,0,0],
//   [0,0,1,0,0,0],
//   [0,0,0,1,0,1],
//   [0,0,0,0,1,0],
//   [1,0,0,0,0,0],
//   [1,0,0,0,0,0],
// ]);
//
// g.applyWeights([1, 2, 3, 4, 5, 6]);
//
// console.log(g.getRelationsMatrix());
//
// const fm = g.getFlowMatrix(2000);
//
// console.log(fm.data);
//
// console.log('SUM 2 column: ', fm.sumColumn(1));
// console.log('SUM 2 row: ', fm.sumRow(1));
//
// console.log(g.findMMCValue());


// IMAGE TEST (DEPRECATED)
// const image = new SymbolicImage(
//   -2,
//   -2,
//   400,
//   400,
//   0.01,
//   5,
//   {
//     x: '0.6 + 0.9*(x*cos(0.4 - 6/(1+x*x+y*y)) - y*sin(0.4 - 6/(1+x*x+y*y)))',
//     y: '0.9*( x*sin(0.4 - 6/(1+x*x+y*y)) + y*cos(0.4 - 6/(1+x*x+y*y)))',
//   },
// );
// image.calcImage();
// image.excludeNonReturnableItems();
//
//
// console.log('ITEMS NUMBER: ', image.size - image.excluded.length);
// console.log('COMPONENTS: ', image.components.filter((item) => !image.excluded.includes(item[0])).length);

Meteor.startup(() => {
  // code to run on server at startup

});
