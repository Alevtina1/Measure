import Graph from './graph.js';

class SubGraph extends Graph {
  constructor (graph, verticesList) {
    super(verticesList.length);

    this.verticesMap = verticesList;

    this.weights = graph.weights.filter((weight, index) => verticesList.includes(index));

    this.setRelations(graph);
  }

  setRelations (graph) {
    this.verticesMap.forEach((oldVertice, newVertice) => {
      const relations = graph.getEdges(oldVertice);

      relations.forEach((relation) => {
        if (this.verticesMap.includes(relation)) {
          this.addEdge(newVertice, this.verticesMap.indexOf(relation));
        }
      });
    });
  }
}

export default SubGraph;
