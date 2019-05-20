import sys
import numpy as np

inputFile = open(sys.argv[1], 'r');
logFile = open(sys.argv[2], 'w');
args = inputFile.read().split('\n');
inputFile.close();

size = int(args[0]);
vertices = eval(args[1]);
matrix = np.zeros((size, size));
maxEigenValue = -1;
maxEigenVector = [];

for i in range(len(vertices)):
    for target in vertices[i]:
        matrix[i][target] = 1.;

logFile.write('Matrix prepared\n');

logFile.write('Start eigen search...\n');
eigenValues, eigenVectors = np.linalg.eig(matrix);
logFile.write('Finish eigen search\n');

eigenVectors = eigenVectors.transpose();

for i in range(len(eigenValues)):
    if (abs(eigenValues[i]) > maxEigenValue):
        maxEigenValue = eigenValues[i];
        maxEigenVector = eigenVectors[i];

formattedEigenVector = [];

for value in maxEigenVector:
    formattedEigenVector.append(float(value));

print(float(maxEigenValue));
print(formattedEigenVector);

logFile.close();
