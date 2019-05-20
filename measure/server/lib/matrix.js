const scalarMul = (vec1, vec2) => vec1.reduce((acc, value, index) => acc + value*vec2[index], 0);

class Matrix {
  constructor (data) {
    this.data = data;
    this.size = data.length;
  }

  transponate () {
    const resultData = [];

    this.data.forEach((row, i) => {
      row.forEach((item, j) => {
        if (!resultData[j]) {
          resultData[j] = [];
        }
        resultData[j][i] = item;
      });
    });

    return new Matrix(resultData);
  }

  sumColumn (index, excludedIndeces = []) {
    return this.data.reduce((acc, row, i) => {
      return excludedIndeces.includes(i) ? acc : acc + row[index];
    }, 0);
  }

  sumRow (index, excludedIndeces = []) {
    return this.data[index].reduce((acc, item, i) => {
      return excludedIndeces.includes(i) ? acc : acc + item;
    }, 0);
  }

  getNonZeroIndeces () {
    const result = [];

    this.data.forEach((row, rowIndex) => {
      row.forEach((item, colIndex) => {
        if (item !== 0) {
          result.push([rowIndex, colIndex]);
        }
      });
    });

    return result;
  }

  getZeroIndeces () {
    const result = [];

    this.data.forEach((row, rowIndex) => {
      row.forEach((item, colIndex) => {
        if (item === 0) {
          result.push([rowIndex, colIndex]);
        }
      });
    });

    return result;
  }

  applyImage (image) {
    this.data = this.data.map((row, rowIndex) => row.map((value, colIndex) => image({ value, rowIndex, colIndex })));
  }

  sumOverall () {
    return this.data.reduce((acc, row) => acc + row.reduce((rowAcc, item) => rowAcc + item, 0), 0);
  }

  divBy (number) {
    this.data = this.data.map((row) => row.map((item) => item/number));
  }

  getItem (rowIndex, colIndex) {
    return this.data[rowIndex][colIndex];
  }

  setItem (rowIndex, colIndex, value) {
    this.data[rowIndex][colIndex] = value;
  }

  selfValues2x2 () {
    const A = this.data[0][0]*this.data[0][0] + this.data[0][1]*this.data[0][1];
    const B = this.data[0][0]*this.data[1][0] + this.data[0][1]*this.data[1][1];
    const C = this.data[1][0]*this.data[1][0] + this.data[1][1]*this.data[1][1];
    const D = Math.sqrt((A - C)*(A - C) + 4*B*B);
    const l1 = Math.abs((-A-C-D)/2);
    const l2 = Math.abs((-A-C+D)/2);

    return 0.5*Math.log(Math.max(l1, l2));
  }

  getRandomVector () {
    const size = this.data.length;
    return Array(size).fill(1);
  }

  mulOnMatrix (matrix) {
    const size = matrix.data.length;
    const newData = Array(size);

    for (let i = 0; i < size; i++) {
      newData.push([]);

      for (let j = 0; j < size; j++) {
        newData[i][j] = 0;

        for (let k = 0; k < size; k++) {
          newData[i][j] += this.data[i][k]*matrix.data[k][j];
        }
      }
    }

    return new Matrix(newData);
  }

  mulOnVector (vector) {
    const size = vector.length;
    const newData = Array(size);

    for (let i = 0; i < size; i++) {
      newData[i] = 0;

      for (let j = 0; j < size; j++) {
        newData[i] += this.data[i][j]*vector[j];
      }
    }

    return newData;
  }

  getMaxSelfValue (iterNumber = 100) {
    const transMatrix = this.transponate();
    let vec1;
    let vec = this.getRandomVector();
    let transVec = this.getRandomVector();
    let selfValue = 0;

    for (let iter = 1; iter < iterNumber; iter++) {
      vec = this.mulOnVector(vec);
      transVec = transMatrix.mulOnVector(transVec);
    }

    vec1 = this.mulOnVector(vec);
    transVec = transMatrix.mulOnVector(transVec);

    return scalarMul(vec1, transVec)/scalarMul(vec, transVec);
  }
}

export default Matrix;
