import _ from 'lodash';

class Graph {
  constructor (size) {
    if (!size) {
      throw new Error('Graph (constructor): specify the non-zero size');
    }

    this.size = size;
    this.clear();

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

  _findSCCIter () {
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
          if (!next) {
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
