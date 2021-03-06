import _ from 'lodash';

class Graph {
  constructor (size) {
    if (!size) {
      throw new Error('Graph (constructor): specify the non-zero size');
    }

    this.size = size;
    this.clear();

    this.getComponentIndexByVertex = this.getComponentIndexByVertex.bind(this);
    this.applyRelationsMatrix = this.applyRelationsMatrix.bind(this);
    this.getRelationsMatrix = this.getRelationsMatrix.bind(this);
    this.removeEdge = this.removeEdge.bind(this);
    this.getEdges = this.getEdges.bind(this);
    this.addEdge = this.addEdge.bind(this);
    this.clear = this.clear.bind(this);
  }

  applyRelationsMatrix (matrix) {
    this.clear();

    _.forEach(matrix, (row, rowIndex) => {
      _.forEach(row, (value, colIndex) => {
        if (value) {
          this.addEdge(rowIndex, colIndex);
        }
      });
    });
  }

  getRelationsMatrix () {
    const matrix = [];

    for (let i = 0; i < this.size; i++) {
      const row = Array(this.size)
        .fill(0)
        .map((value, index) => this.v[i].includes(index) ? 1 : 0);

      matrix.push(row);
    }

    return matrix;
  }

  _findSCCIter (log=true) {
    const visited = Array(this.size).fill(false);
    const lowLink = Array(this.size).fill(this.size);
    const isRoot = Array(this.size).fill(true);
    const stack = [];
    const returnStack = [];
    let step = 0;
    let visitedCount = 0;
    let next = 0;

    this.components = [];

    for (let u = 0; u < this.size; u++) {
      next = u;
      if (!visited[next]) {
        dfsLoop: while (true) {
          if (!visited[next]) {
            lowLink[next] = step;
            visited[next] = true;
            stack.push(next);
            step += 1;
            visitedCount += 1;
            if (visitedCount % 1000 === 0 && log) {
              console.log(`SCC: ${visitedCount}/${this.size}`);
            }
          }

          for (var v of this.v[next]) {
            if (!visited[v]) {
              returnStack.push(next);
              next = v;
              continue dfsLoop;
            }
            if (lowLink[next] > lowLink[v]) {
              lowLink[next] = lowLink[v];
              isRoot[next] = false;
            }
          }

          if (isRoot[next]) {
            const component = [];
            while (1) {
              const nextItem = stack.pop();
              component.push(nextItem);
              lowLink[nextItem] = this.size;
              if (nextItem === next) {
                break;
              }
            }
            this.components.push(component);
          }

          next = returnStack.pop();
          if (next === undefined) {
            break;
          }
          continue dfsLoop;
        }
      }
    }
  }

  _findSCC () {
    this.visited = Array(this.size).fill(false);
    this.lowLink = Array(this.size).fill(this.size);
    this.stack = [];
    this.components = [];
    this.step = 0;
    this.visitedCount = 0;

    for (let u = 0; u < this.size; u++) {
      if (!this.visited[u]) {
        this._dfsSCC(u);
      }
    }
  }

  _dfsSCC (u) {
    const component = [];
    let isComponentRoot = true;
    this.lowLink[u] = this.step;
    this.visited[u] = true;
    this.stack.push(u);
    this.step += 1;
    this.visitedCount += 1;
    if (this.visitedCount % 1000 === 0) {
      console.log(`SCC: ${this.visitedCount}/${this.size}`);
    }

    _.forEach(this.v[u], (v) => {
      if (!this.visited[v]) {
        this._dfsSCC(v);
      }
      if (this.lowLink[u] > this.lowLink[v]) {
        this.lowLink[u] = this.lowLink[v];
        isComponentRoot = false;
      }
    });

    if (isComponentRoot) {
      while (1) {
        const next = this.stack.pop();
        component.push(next);
        this.lowLink[next] = this.size;
        if (next === u) {
          break;
        }
      }
      this.components.push(component);
    }
  }

  getCanonicalRenumeralGraph () {
    if (!this.components || !this.components.length) {
      this._findSCCIter(false);
    }

    const componentsRelationsMatrix = this.getComponentsRelationsMatrix();
    const componentsOrder = [];
    const vertexReversedOrder = [];
    const vertexOrder = Array(this.size);

    while (componentsOrder.length !== this.components.length) {
      componentsRelationsMatrix.forEach((componentRelations, index) => {
        let pushIt = true;

        componentRelations.forEach((relation, relIndex) => {
          if (relIndex !== index && relation) {
            pushIt = false;
          }
        });

        if (pushIt) {
          componentsOrder.unshift(this.components[index]);
          for (let i = 0; i < componentsRelationsMatrix.length; i++) {
            componentsRelationsMatrix[i][index] = 0;
          }
        }
      });
    }
    console.log('Components order: ', componentsOrder);
    componentsOrder.forEach((component) => {
      component.forEach((vertex) => vertexReversedOrder.push(vertex));
    });

    vertexReversedOrder.forEach((oldVertex, newVertex) => vertexOrder[oldVertex] = newVertex);

    return this.getRenumeralGraph(vertexOrder);
  }

  getComponentIndexByVertex (vertex) {
    for (let i = 0; i < this.components.length; i++) {
      if (this.components[i].includes(vertex)) {
        return i;
      }
    }
    return undefined;
  }

  getComponentsRelationsMatrix () {
    if (!this.components || !this.components.length) {
      this._findSCCIter(false);
    }

    const size = this.components.length;
    const matrix = [];

    for (let i = 0; i < size; i++) {
      matrix.push(this.getComponentsRelations(i));
    }

    return matrix;
  }

  getComponentsRelations (index) {
    const size = this.components.length;
    const component = this.components[index];
    const result = Array(size)
      .fill(0);

    component.forEach((vertex) => {
      this.v[vertex].forEach((resultVertex) => {
        const resultComponentIndex = this.getComponentIndexByVertex(resultVertex);
        if (resultComponentIndex !== undefined) {
          result[resultComponentIndex] = 1;
        }
      });
    });

    return result;
  }

  getRenumeralGraph (order) {
    const newGraph = new Graph(this.size);

    this.v.forEach((ways, index) => {
      ways.forEach((way) => newGraph.addEdge(order[index], order[way]));
    });

    return newGraph;
  }

  applyWeights (weightsMap) {
    this.weights = weightsMap;
  }

  findExtremalCycles (index) {
    const stack = [index];
    const way = [];
    let next;
    let nextWays = [];
    let currentCost = 0;
    let lowCost = Infinity;
    let highCost = -Infinity;
    let visited = Array(this.size).fill(false);

    visited[index] = true;

    while (stack.length) {
      next = stack.pop();
      way.push(next);
      nextWays = this.getEdges(next);

      for (let i of nextWays) {
        if (i === index) {
          currentCost = this.computeWayCost(way);
          lowCost = lowCost > currentCost ? currentCost : lowCost;
          highCost = highCost < currentCost ? currentCost : highCost;
        }
        if (!visited[i]) {
          stack.push(i);
          visited[i] = true;
        }
      }
    }

    this.extremalCycles = { low: lowCost, high: highCost };
  }

  computeWayCost (way) {
    let result = 0;

    way.forEach((index) => result += this.weights[index]);

    return result;
  }

  addEdge (a, b) {
    this.v[a] = _.sortedUniq(_.sortBy([...this.v[a], b]));
  }

  removeEdge (a, b) {
    this.v[a] = this.v[a].filter((v) => v !== b);
  }

  getEdges (a) {
    return this.v[a];
  }

  clear () {
    this.v = [];

    for (let i = 0; i < this.size; i++) {
      this.v.push([]);
    }
  }
}

export default Graph;
