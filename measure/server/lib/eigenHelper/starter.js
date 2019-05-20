const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const scriptPath = path.join(process.cwd(), '../../../../..', __dirname, 'script.py');
const bufferPath = path.join(process.cwd(), '../../../../..', __dirname, 'buffer');
const logPath = path.join(process.cwd(), '../../../../..', __dirname, 'log');

const computeEigens = async (vertices, callback) => {
  fs.writeFile(bufferPath, `${vertices.length}\n${JSON.stringify(vertices)}`, () => {
    exec(`python ${scriptPath} ${bufferPath} ${logPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
      } else if (stdout) {
        const resultArray = stdout.split('\n');
        const eigenValue = parseFloat(resultArray[0]);
        const eigenVector = resultArray[1]
        .replace(',', '')
        .replace('[', '')
        .replace(']', '')
        .split(' ')
        .map(parseFloat)
        .filter((number) => !Number.isNaN(number));
        // console.log(`PYTHON OUT: \n${stdout}\n`);
        // console.log(eigenVector);
        // Normalize vector:
        const sum = eigenVector.reduce((sum, item) => sum + item, 0);
        const normVector = eigenVector.map((item) => item /= sum);

        callback({ value: eigenValue, vector: normVector });
      } else {
        console.error(`Python throws: ${stderr}`);
      }
    });
  });
};

export default computeEigens;
