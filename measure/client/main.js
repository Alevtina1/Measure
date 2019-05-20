import { Meteor } from 'meteor/meteor';
import React from 'react';
import { render } from 'react-dom';

import Layout from './lib/layout';

import Graph from './lib/lib/graph';

const g = new Graph(6);
// g.applyRelationsMatrix([
//   [0,0,0,0,0,0,0,0,],
//   [0,0,0,0,1,1,0,1,],
//   [0,1,0,1,0,0,0,0,],
//   [1,1,1,0,0,1,0,0,],
//   [0,0,1,0,0,0,0,0,],
//   [0,1,0,0,0,0,0,0,],
//   [0,0,0,0,0,0,1,0,],
//   [0,0,1,0,1,0,0,0,],
// ]);
// g.applyRelationsMatrix([
//   [0,1,1,0,0,0,0],
//   [1,0,0,0,0,0,0],
//   [0,0,0,1,1,0,0],
//   [0,0,1,0,0,0,0],
//   [0,0,0,0,0,1,0],
//   [0,0,0,0,1,0,0],
//   [0,0,0,0,0,0,0],
// ]);
g.applyRelationsMatrix([
  [0,0,0,1,0,0],
  [1,0,1,0,0,0],
  [1,0,0,0,0,1],
  [0,1,1,0,0,0],
  [1,0,0,1,0,0],
  [0,0,0,0,1,0],
]);
g.applyWeights([1,2,3,4,5,6]);



Meteor.startup(() => {
  const rootDiv = document.createElement('div');
  rootDiv.id = 'root';
  document.body.appendChild(rootDiv);
  render(<Layout />, document.getElementById('root'));

});
