export interface Lab {
  id: string;
  title: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  blurb: string;
  metric: "accuracy" | "f1" | "mse" | "r2";
  higherIsBetter: boolean;
  baseline: number;
  target: number;
  timeLimitSeconds: number;
  constraints: string[];
  trainData: { features: number[][]; labels: number[] };
  testData: { features: number[][]; labels: (number | number[])[] };
  starterCode: string;
  hint: string;
  points: number;
  solutionCode: string;
  solutionNotes: string[];
}

const LAB_01_TRAIN = {
  features: [
    [0.045, -0.856],
    [-0.209, 0.197],
    [-0.627, 0.177],
    [1.982, -0.602],
    [-0.202, -0.143],
    [-0.916, -1.008],
    [0.314, 0.248],
    [-0.311, -0.499],
    [-0.463, 0.987],
    [0.373, -1.273],
    [0.505, -0.612],
    [-0.402, -0.849],
    [0.412, 0.473],
    [-0.695, 1.116],
    [0.587, -1.203],
    [-0.253, -0.586],
    [-0.254, 0.479],
    [-1.109, 1.253],
    [0.754, 1.016],
    [-1.542, -0.487],
    [0.34, -0.331],
    [-0.523, 1.13],
    [-1.069, -1.176],
    [0.553, 1.276],
    [0.774, -0.713],
    [1.238, -0.75],
    [-0.98, 0.304],
    [0.522, 0.323],
    [-2.123, -1.06],
    [-0.22, 0.316],
  ],
  labels: [0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0],
};

const LAB_01_TEST = {
  features: [
    [0.042, -0.506],
    [0.044, 0.637],
    [-0.591, 0.936],
    [0.876, 0.01],
    [-0.562, -1.856],
    [-0.466, -1.677],
    [0.608, 0.161],
    [-0.581, -1.425],
    [-1.539, 0.307],
    [-0.122, 1.285],
    [0.448, 0.106],
    [1.093, -0.756],
    [-1.936, -1.312],
    [0.044, -0.584],
    [-0.469, -1.215],
  ],
  labels: [0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0],
};

const LAB_02_TRAIN = {
  features: [
    [3.0, 2.0, 1.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 1.0, 3.0, 1.0, 2.0],
    [0.0, 0.0, 1.0, 3.0, 2.0, 4.0],
    [0.0, 0.0, 0.0, 2.0, 4.0, 5.0],
    [4.0, 3.0, 2.0, 1.0, 1.0, 0.0],
    [0.0, 0.0, 1.0, 1.0, 2.0, 4.0],
    [0.0, 1.0, 1.0, 1.0, 2.0, 2.0],
    [1.0, 1.0, 1.0, 3.0, 1.0, 4.0],
    [5.0, 3.0, 2.0, 0.0, 1.0, 1.0],
    [1.0, 1.0, 1.0, 1.0, 1.0, 5.0],
    [0.0, 0.0, 1.0, 2.0, 4.0, 4.0],
    [1.0, 0.0, 1.0, 3.0, 3.0, 3.0],
    [3.0, 4.0, 2.0, 0.0, 1.0, 1.0],
    [1.0, 1.0, 1.0, 2.0, 4.0, 4.0],
    [0.0, 1.0, 1.0, 1.0, 3.0, 2.0],
    [0.0, 1.0, 1.0, 3.0, 3.0, 4.0],
    [4.0, 4.0, 1.0, 0.0, 0.0, 0.0],
    [1.0, 0.0, 0.0, 3.0, 3.0, 2.0],
    [1.0, 1.0, 0.0, 2.0, 3.0, 3.0],
    [0.0, 0.0, 1.0, 2.0, 2.0, 2.0],
    [3.0, 2.0, 2.0, 1.0, 1.0, 1.0],
    [1.0, 1.0, 1.0, 3.0, 2.0, 4.0],
    [0.0, 1.0, 1.0, 1.0, 1.0, 4.0],
    [1.0, 1.0, 0.0, 3.0, 1.0, 5.0],
    [3.0, 3.0, 3.0, 0.0, 0.0, 1.0],
    [0.0, 1.0, 0.0, 2.0, 1.0, 3.0],
    [0.0, 0.0, 1.0, 2.0, 3.0, 5.0],
    [1.0, 0.0, 1.0, 1.0, 2.0, 5.0],
    [4.0, 3.0, 2.0, 0.0, 0.0, 0.0],
    [1.0, 1.0, 0.0, 1.0, 2.0, 4.0],
    [1.0, 0.0, 1.0, 3.0, 1.0, 3.0],
    [1.0, 0.0, 1.0, 2.0, 4.0, 5.0],
  ],
  labels: [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0],
};

const LAB_02_TEST = {
  features: [
    [4.0, 4.0, 1.0, 0.0, 1.0, 1.0],
    [1.0, 1.0, 1.0, 3.0, 3.0, 4.0],
    [0.0, 0.0, 0.0, 2.0, 1.0, 4.0],
    [1.0, 0.0, 1.0, 2.0, 4.0, 4.0],
    [3.0, 2.0, 2.0, 1.0, 1.0, 1.0],
    [0.0, 0.0, 1.0, 1.0, 3.0, 4.0],
    [0.0, 1.0, 1.0, 2.0, 4.0, 3.0],
    [1.0, 1.0, 1.0, 3.0, 3.0, 3.0],
    [3.0, 3.0, 2.0, 1.0, 0.0, 1.0],
    [1.0, 1.0, 1.0, 2.0, 1.0, 5.0],
    [1.0, 0.0, 0.0, 2.0, 3.0, 3.0],
    [1.0, 0.0, 0.0, 3.0, 2.0, 3.0],
    [4.0, 2.0, 2.0, 0.0, 1.0, 1.0],
    [1.0, 1.0, 0.0, 3.0, 3.0, 2.0],
    [0.0, 0.0, 1.0, 1.0, 2.0, 2.0],
    [1.0, 1.0, 1.0, 2.0, 4.0, 4.0],
    [4.0, 4.0, 3.0, 0.0, 0.0, 1.0],
    [1.0, 0.0, 1.0, 3.0, 2.0, 2.0],
    [0.0, 0.0, 0.0, 3.0, 3.0, 4.0],
    [1.0, 0.0, 1.0, 1.0, 3.0, 2.0],
  ],
  labels: [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0],
};

const LAB_03_TRAIN = {
  features: [
    [2281.0, 2.0, 18.0],
    [2385.0, 3.0, 16.0],
    [2998.0, 4.0, 25.0],
    [1368.0, 1.0, 17.0],
    [933.0, 4.0, 4.0],
    [1618.0, 5.0, 9.0],
    [2289.0, 1.0, 18.0],
    [1265.0, 3.0, 33.0],
    [1292.0, 1.0, 11.0],
    [870.0, 2.0, 32.0],
    [2589.0, 2.0, 9.0],
    [2906.0, 2.0, 28.0],
    [2768.0, 4.0, 21.0],
    [1049.0, 3.0, 15.0],
    [1307.0, 2.0, 0.0],
    [909.0, 4.0, 14.0],
    [1015.0, 1.0, 6.0],
    [1045.0, 2.0, 27.0],
    [1268.0, 3.0, 21.0],
    [2463.0, 4.0, 9.0],
    [2481.0, 5.0, 25.0],
    [2201.0, 4.0, 29.0],
    [1468.0, 5.0, 23.0],
    [1832.0, 5.0, 3.0],
    [2076.0, 4.0, 6.0],
    [1025.0, 5.0, 27.0],
    [833.0, 3.0, 13.0],
    [2467.0, 2.0, 8.0],
    [2556.0, 2.0, 0.0],
    [2803.0, 4.0, 25.0],
  ],
  labels: [264.0, 276.0, 361.1, 173.2, 161.2, 228.1, 238.1, 183.4, 174.3, 140.2, 285.0, 350.3, 337.6, 165.2, 163.1, 166.0, 139.3, 147.5, 169.5, 323.7, 326.3, 254.5, 214.4, 266.5, 303.3, 173.0, 148.8, 283.8, 323.9, 330.9],
};

const LAB_03_TEST = {
  features: [
    [1211.0, 5.0, 19.0],
    [1626.0, 4.0, 1.0],
    [2359.0, 1.0, 30.0],
    [809.0, 5.0, 10.0],
    [1367.0, 4.0, 0.0],
    [2912.0, 5.0, 37.0],
    [2104.0, 1.0, 11.0],
    [1321.0, 3.0, 31.0],
    [2831.0, 1.0, 11.0],
    [1428.0, 5.0, 24.0],
    [2706.0, 1.0, 29.0],
    [1178.0, 1.0, 3.0],
    [1972.0, 4.0, 0.0],
    [2596.0, 3.0, 9.0],
    [2549.0, 3.0, 10.0],
  ],
  labels: [221.0, 204.3, 241.5, 162.5, 228.5, 346.5, 241.4, 171.0, 300.8, 218.3, 259.0, 158.1, 258.0, 306.4, 294.5],
};

const LAB_04_TRAIN = {
  features: [
    [-2.642],
    [-0.817],
    [1.369],
    [-0.924],
    [-2.523],
    [1.996],
    [2.519],
    [2.568],
    [-1.198],
    [0.013],
    [-1.449],
    [0.058],
    [-2.996],
    [-1.711],
    [-2.683],
    [-0.662],
    [-1.831],
    [0.101],
    [2.878],
    [-1.41],
    [1.271],
    [2.243],
    [-1.327],
    [-0.127],
    [0.461],
    [1.075],
    [1.981],
    [1.229],
    [-1.633],
    [-1.708],
  ],
  labels: [8.349, 2.022, 1.471, 2.291, 8.048, 3.444, 5.151, 4.546, 2.811, 1.435, 3.796, 0.984, 9.692, 5.108, 8.136, 2.298, 4.729, 1.141, 5.503, 3.466, 2.262, 2.934, 2.896, 0.699, -0.655, 2.116, 2.881, 0.957, 4.315, 4.092],
};

const LAB_04_TEST = {
  features: [
    [0.441],
    [-1.66],
    [2.644],
    [-1.716],
    [-1.895],
    [0.47],
    [-1.664],
    [1.98],
    [1.006],
    [-1.83],
    [-1.954],
    [0.52],
    [2.248],
    [-0.625],
    [-2.637],
  ],
  labels: [1.065, 4.972, 4.529, 3.75, 4.672, 1.253, 4.736, 2.983, 1.138, 3.605, 5.151, 1.12, 3.864, 1.937, 8.932],
};

const LAB_05_TRAIN = {
  features: [
    [-1.0, -0.6],
    [0.04, 8.21],
    [7.1, -0.24],
    [6.86, 8.63],
    [2.04, 0.12],
    [-0.46, 8.18],
    [6.98, -0.94],
    [8.44, 7.98],
    [0.12, -0.71],
    [0.49, 8.11],
    [7.51, 0.45],
    [7.82, 8.0],
    [-0.66, -0.26],
    [0.91, 7.93],
    [7.73, 0.07],
    [7.71, 8.74],
    [0.07, -0.38],
    [-0.14, 7.95],
    [8.89, -1.29],
    [6.75, 6.55],
    [-1.03, -0.93],
    [-0.29, 6.79],
    [6.87, 1.14],
    [7.96, 6.99],
    [0.31, 1.36],
    [-0.07, 7.93],
    [7.89, -0.4],
    [7.2, 8.67],
    [-0.5, 1.78],
    [0.64, 7.83],
    [7.06, -0.2],
    [9.52, 7.12],
    [0.18, 0.25],
    [1.16, 7.61],
    [8.06, 0.3],
    [8.67, 8.25],
  ],
  labels: [2.009, 3.879, 7.724, 9.475, 2.835, 3.751, 8.018, 10.311, 2.453, 4.091, 7.755, 9.468, 1.958, 4.125, 7.929, 9.623, 2.049, 3.623, 8.028, 10.125, 2.294, 3.993, 8.259, 9.67, 2.616, 3.997, 7.675, 9.606, 2.226, 4.591, 8.119, 10.549, 1.812, 4.776, 7.796, 9.701],
};

const LAB_05_TEST = {
  features: [
    [0.23, 0.58],
    [0.69, 10.11],
    [7.31, 0.74],
    [7.41, 8.6],
    [-0.88, -0.6],
    [-0.41, 7.67],
    [6.94, -2.16],
    [7.66, 9.23],
    [0.4, -0.13],
    [0.33, 8.03],
    [8.61, 1.2],
    [7.92, 7.65],
    [0.83, 0.32],
    [-0.07, 8.43],
    [8.44, 0.48],
    [8.0, 8.94],
  ],
  labels: [1.416, 4.368, 7.545, 10.443, 1.956, 3.827, 8.231, 10.372, 2.813, 3.931, 7.901, 9.708, 2.094, 3.482, 7.993, 9.672],
};

const LAB_06_TRAIN = {
  features: [
    [5.37, 0.54, 0.0, 0.56],
    [6.74, 0.47, 1.0, 0.49],
    [8.34, 0.49, 0.0, 0.31],
    [4.33, 0.58, 0.0, 0.62],
    [7.09, 0.42, 0.0, 0.64],
    [8.09, 0.46, 1.0, 0.56],
    [6.03, 0.62, 1.0, 0.59],
    [7.08, 0.48, 0.0, 0.4],
    [6.04, 0.44, 0.0, 0.33],
    [4.16, 0.55, 0.0, 0.53],
    [6.92, 0.39, 1.0, 0.49],
    [7.86, 0.27, 1.0, 0.47],
    [8.41, 0.54, 2.0, 0.45],
    [9.62, 0.33, 0.0, 0.32],
    [6.85, 0.38, 1.0, 0.24],
    [6.21, 0.37, 3.0, 0.64],
    [7.27, 0.29, 0.0, 0.34],
    [8.01, 0.46, 0.0, 0.39],
    [6.1, 0.62, 0.0, 0.71],
    [6.64, 0.54, 1.0, 0.56],
    [7.63, 0.44, 1.0, 0.44],
    [9.08, 0.38, 3.0, 0.77],
    [5.61, 0.46, 0.0, 0.27],
    [9.93, 0.34, 1.0, 0.53],
    [6.08, 0.65, 2.0, 0.48],
    [9.15, 0.39, 0.0, 0.32],
    [8.68, 0.42, 1.0, 0.48],
    [7.79, 0.7, 0.0, 0.49],
    [9.37, 0.45, 1.0, 0.53],
    [8.42, 0.51, 0.0, 0.57],
    [8.06, 0.46, 3.0, 0.57],
    [9.55, 0.44, 0.0, 0.5],
    [6.98, 0.48, 1.0, 0.3],
    [6.94, 0.51, 2.0, 0.51],
    [9.56, 0.31, 1.0, 0.26],
    [6.3, 0.38, 1.0, 0.47],
    [7.66, 0.56, 2.0, 0.55],
    [8.6, 0.43, 1.0, 0.4],
    [8.93, 0.31, 1.0, 0.25],
    [7.59, 0.66, 2.0, 0.54],
  ],
  labels: [1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0],
};

const LAB_06_TEST = {
  features: [
    [8.14, 0.62, 1.0, 0.71],
    [5.39, 0.4, 1.0, 0.55],
    [7.47, 0.6, 0.0, 0.44],
    [3.76, 0.58, 2.0, 0.63],
    [9.21, 0.34, 1.0, 0.48],
    [7.48, 0.48, 1.0, 0.42],
    [4.88, 0.49, 2.0, 0.68],
    [7.57, 0.36, 1.0, 0.41],
    [8.68, 0.39, 1.0, 0.41],
    [8.4, 0.52, 3.0, 0.69],
    [5.57, 0.45, 1.0, 0.3],
    [7.17, 0.52, 0.0, 0.32],
    [4.08, 0.51, 1.0, 0.49],
    [9.85, 0.31, 0.0, 0.33],
    [7.69, 0.5, 0.0, 0.26],
    [7.51, 0.87, 1.0, 0.7],
    [8.07, 0.47, 0.0, 0.51],
    [7.49, 0.44, 1.0, 0.45],
    [7.53, 0.63, 0.0, 0.37],
    [8.65, 0.45, 0.0, 0.44],
  ],
  labels: [1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0],
};

const LAB_07_TRAIN = {
  features: [
    [2.19, 5.87],
    [5.49, 7.85],
    [8.68, 7.62],
    [4.31, 5.49],
    [2.75, 7.78],
    [0.44, 5.1],
    [5.15, 6.45],
    [4.11, 6.22],
    [5.89, 6.36],
    [2.09, 0.85],
    [9.67, 4.69],
    [9.94, 4.63],
    [5.06, 3.69],
    [8.09, 6.85],
    [7.43, 9.97],
    [1.64, 9.12],
    [5.62, 2.62],
    [3.93, 2.83],
    [2.41, 0.03],
    [3.82, 5.4],
    [8.64, 5.5],
    [6.75, 5.21],
    [1.18, 1.53],
    [9.57, 5.29],
    [4.6, 2.96],
    [9.05, 5.84],
    [6.6, 8.75],
    [4.23, 5.39],
  ],
  labels: [22.29, 34.21, 41.16, 41.01, 26.29, 16.91, 30.23, 29.61, 31.85, 13.83, 38.38, 25.79, 26.32, 38.81, 41.35, 24.67, 25.23, 21.24, 13.84, 25.61, 38.02, 33.18, 27.24, 38.94, 23.72, 39.79, 37.13, 26.55],
};

const LAB_07_TEST = {
  features: [
    [7.33, 1.07],
    [3.9, 4.4],
    [9.93, 6.3],
    [5.36, 6.2],
    [0.53, 6.24],
    [2.41, 4.12],
    [8.83, 2.33],
    [2.78, 2.35],
    [4.15, 7.13],
    [0.83, 0.43],
    [6.67, 6.28],
    [8.16, 7.17],
  ],
  labels: [27.96, 23.99, 42.45, 30.39, 19.7, 20.35, 34.17, 18.68, 28.11, 10.47, 34.1, 39.53],
};

const LAB_08_TRAIN = {
  features: [
    [0.704, 0.734],
    [-0.704, 0.734],
    [0.704, -0.734],
    [-0.704, -0.734],
    [0.534, 0.395],
    [-0.534, 0.395],
    [0.534, -0.395],
    [-0.534, -0.395],
    [0.726, 0.476],
    [-0.726, 0.476],
    [0.726, -0.476],
    [-0.726, -0.476],
    [0.816, 0.545],
    [-0.816, 0.545],
    [0.816, -0.545],
    [-0.816, -0.545],
    [0.512, 0.675],
    [-0.512, 0.675],
    [0.512, -0.675],
    [-0.512, -0.675],
    [0.893, 0.73],
    [-0.893, 0.73],
    [0.893, -0.73],
    [-0.893, -0.73],
    [0.911, 0.681],
    [-0.911, 0.681],
    [0.911, -0.681],
    [-0.911, -0.681],
    [0.931, 0.347],
    [-0.931, 0.347],
    [0.931, -0.347],
    [-0.931, -0.347],
  ],
  labels: [1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0],
};

const LAB_08_TEST = {
  features: [
    [0.339, 0.375],
    [-0.339, 0.375],
    [0.339, -0.375],
    [-0.339, -0.375],
    [0.537, 0.29],
    [-0.537, 0.29],
    [0.537, -0.29],
    [-0.537, -0.29],
    [0.607, 0.967],
    [-0.607, 0.967],
    [0.607, -0.967],
    [-0.607, -0.967],
    [0.975, 0.263],
    [-0.975, 0.263],
    [0.975, -0.263],
    [-0.975, -0.263],
    [0.606, 0.577],
    [-0.606, 0.577],
    [0.606, -0.577],
    [-0.606, -0.577],
  ],
  labels: [1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0],
};

/**
 * Dataset-driven challenges scored against a target on held-out data.
 */
export const LABS: Lab[] = [
  {
    id: "lab-01",
    title: "Logistic Regression, From Scratch",
    category: "Classification",
    difficulty: "Easy",
    blurb:
      "Two continuous features, one binary label. Fit a classifier and score accuracy on held-out rows; a majority-class guess scores 0.60.",
    metric: "accuracy",
    higherIsBetter: true,
    baseline: 0.6,
    target: 0.85,
    timeLimitSeconds: 300,
    constraints: [
      "Define predict(train_X, train_y, test_X) and return exactly one value per test row.",
      "Pure Python or numpy both run; no external data or network access.",
      "Return probabilities or 0/1 labels; values are thresholded at 0.5.",
    ],
    trainData: LAB_01_TRAIN,
    testData: LAB_01_TEST,
    starterCode: `def predict(train_X, train_y, test_X):
    # Baseline: predict the majority class.
    # Replace with logistic regression, then return one value per test row.
    rate = sum(train_y) / len(train_y)
    label = 1 if rate > 0.5 else 0
    return [label for _ in test_X]`,
    hint:
      "Standardize both features, then run batch gradient descent on the logistic loss for a few thousand iterations.",
    points: 10,
    solutionCode: `import math


def predict(train_X, train_y, test_X):
    rows = len(train_X)
    cols = len(train_X[0])
    means = [sum(row[j] for row in train_X) / rows for j in range(cols)]
    stds = []
    for j in range(cols):
        var = sum((row[j] - means[j]) ** 2 for row in train_X) / rows
        stds.append(math.sqrt(var) if var > 0 else 1.0)

    def scale(row):
        return [(row[j] - means[j]) / stds[j] for j in range(cols)] + [1.0]

    X = [scale(row) for row in train_X]
    w = [0.0] * (cols + 1)
    rate = 0.5
    for _ in range(2000):
        grad = [0.0] * (cols + 1)
        for xi, y in zip(X, train_y):
            z = sum(w[j] * xi[j] for j in range(cols + 1))
            p = 1.0 / (1.0 + math.exp(-z))
            for j in range(cols + 1):
                grad[j] += (p - y) * xi[j]
        for j in range(cols + 1):
            w[j] -= rate * grad[j] / rows

    out = []
    for row in test_X:
        xi = scale(row)
        z = sum(w[j] * xi[j] for j in range(cols + 1))
        out.append(1.0 / (1.0 + math.exp(-z)))
    return out`,
    solutionNotes: [
      "Standardize both features first so gradient descent takes even steps on each weight.",
      "Fit p = sigmoid(w*x + b) with 2000 batch gradient-descent steps on the log loss.",
      "Return probabilities; the harness reads anything at or above 0.5 as class 1.",
      "The starter's constant majority guess is pinned at 0.60 accuracy, below the 0.85 target.",
    ],
  },
  {
    id: "lab-02",
    title: "Spam Filter",
    category: "NLP",
    difficulty: "Medium",
    blurb:
      "Classify messages from six keyword counts. F1 is measured for the spam class, and predicting every message as ham scores 0.00.",
    metric: "f1",
    higherIsBetter: true,
    baseline: 0,
    target: 0.85,
    timeLimitSeconds: 600,
    constraints: [
      "Define predict(train_X, train_y, test_X) and return exactly one value per test row.",
      "Pure Python or numpy both run; no external data or network access.",
      "Return a spam probability or 0/1 label; values are thresholded at 0.5.",
      "F1 is computed for the spam class (label 1).",
    ],
    trainData: LAB_02_TRAIN,
    testData: LAB_02_TEST,
    starterCode: `def predict(train_X, train_y, test_X):
    # Baseline: predict the majority class.
    # Replace with your classifier, then return one value per test row.
    rate = sum(train_y) / len(train_y)
    label = 1 if rate > 0.5 else 0
    return [label for _ in test_X]`,
    hint:
      "Logistic regression on standardized counts works. Recall matters as much as precision, so do not default every message to ham.",
    points: 25,
    solutionCode: `import math


def predict(train_X, train_y, test_X):
    rows = len(train_X)
    cols = len(train_X[0])
    means = [sum(row[j] for row in train_X) / rows for j in range(cols)]
    stds = []
    for j in range(cols):
        var = sum((row[j] - means[j]) ** 2 for row in train_X) / rows
        stds.append(math.sqrt(var) if var > 0 else 1.0)

    def scale(row):
        return [(row[j] - means[j]) / stds[j] for j in range(cols)] + [1.0]

    X = [scale(row) for row in train_X]
    w = [0.0] * (cols + 1)
    rate = 0.5
    for _ in range(2000):
        grad = [0.0] * (cols + 1)
        for xi, y in zip(X, train_y):
            z = sum(w[j] * xi[j] for j in range(cols + 1))
            p = 1.0 / (1.0 + math.exp(-z))
            for j in range(cols + 1):
                grad[j] += (p - y) * xi[j]
        for j in range(cols + 1):
            w[j] -= rate * grad[j] / rows

    out = []
    for row in test_X:
        xi = scale(row)
        z = sum(w[j] * xi[j] for j in range(cols + 1))
        out.append(1.0 / (1.0 + math.exp(-z)))
    return out`,
    solutionNotes: [
      "Standardize the six keyword counts so no single column dominates the gradient.",
      "Fit logistic regression on the standardized counts and return spam probabilities.",
      "Precision and recall both matter for F1: answering ham for every row scores 0.00.",
      "The fitted weights lean positive on the early keywords and negative on the later ones.",
    ],
  },
  {
    id: "lab-03",
    title: "House Price Regression",
    category: "Regression",
    difficulty: "Easy",
    blurb:
      "Estimate sale price from size, bedrooms, and age. Lower is better: predicting the training mean scores an MSE of 2879.57.",
    metric: "mse",
    higherIsBetter: false,
    baseline: 2879.57,
    target: 400,
    timeLimitSeconds: 300,
    constraints: [
      "Define predict(train_X, train_y, test_X) and return exactly one value per test row.",
      "Pure Python or numpy both run; no external data or network access.",
      "Return a numeric prediction for every test row.",
    ],
    trainData: LAB_03_TRAIN,
    testData: LAB_03_TEST,
    starterCode: `def predict(train_X, train_y, test_X):
    # Baseline: predict the mean training price.
    # Replace with least squares, then return one value per test row.
    mean = sum(train_y) / len(train_y)
    return [mean for _ in test_X]`,
    hint:
      "Least squares has a closed form: solve the normal equations (X-transpose X) theta = X-transpose y.",
    points: 10,
    solutionCode: `def predict(train_X, train_y, test_X):
    rows = len(train_X)
    X = [[1.0] + list(row) for row in train_X]
    p = len(X[0])
    A = [[0.0] * (p + 1) for _ in range(p)]
    for i in range(rows):
        for j in range(p):
            for k in range(p):
                A[j][k] += X[i][j] * X[i][k]
            A[j][p] += X[i][j] * train_y[i]

    for col in range(p):
        pivot = col
        for r in range(col + 1, p):
            if abs(A[r][col]) > abs(A[pivot][col]):
                pivot = r
        A[col], A[pivot] = A[pivot], A[col]
        for r in range(p):
            if r == col:
                continue
            factor = A[r][col] / A[col][col]
            for c in range(col, p + 1):
                A[r][c] -= factor * A[col][c]

    theta = [A[i][p] / A[i][i] for i in range(p)]
    return [sum(theta[j] * ([1.0] + list(row))[j] for j in range(p)) for row in test_X]`,
    solutionNotes: [
      "Prepend a constant 1 column so the fit gets an intercept as the first weight.",
      "Build the 4x4 normal equations in one pass over the training rows.",
      "Solve them with Gaussian elimination and partial pivoting.",
      "The closed form needs no learning rate and lands well under the MSE target.",
    ],
  },
  {
    id: "lab-04",
    title: "Noisy Quadratic",
    category: "Regression",
    difficulty: "Medium",
    blurb:
      "The target follows a noisy quadratic in one feature. Explain the variance on held-out data; a straight-line fit only reaches R-squared 0.26.",
    metric: "r2",
    higherIsBetter: true,
    baseline: 0.26,
    target: 0.88,
    timeLimitSeconds: 600,
    constraints: [
      "Define predict(train_X, train_y, test_X) and return exactly one value per test row.",
      "Pure Python or numpy both run; no external data or network access.",
      "Return a numeric prediction for every test row.",
    ],
    trainData: LAB_04_TRAIN,
    testData: LAB_04_TEST,
    starterCode: `def predict(train_X, train_y, test_X):
    # Baseline: predict the mean training target.
    # Replace with a quadratic fit, then return one value per test row.
    mean = sum(train_y) / len(train_y)
    return [mean for _ in test_X]`,
    hint:
      "Engineer x-squared as a second feature, then fit least squares on [1, x, x-squared].",
    points: 25,
    solutionCode: `def predict(train_X, train_y, test_X):
    rows = len(train_X)
    X = [[1.0, row[0], row[0] * row[0]] for row in train_X]
    p = 3
    A = [[0.0] * (p + 1) for _ in range(p)]
    for i in range(rows):
        for j in range(p):
            for k in range(p):
                A[j][k] += X[i][j] * X[i][k]
            A[j][p] += X[i][j] * train_y[i]

    for col in range(p):
        pivot = col
        for r in range(col + 1, p):
            if abs(A[r][col]) > abs(A[pivot][col]):
                pivot = r
        A[col], A[pivot] = A[pivot], A[col]
        for r in range(p):
            if r == col:
                continue
            factor = A[r][col] / A[col][col]
            for c in range(col, p + 1):
                A[r][c] -= factor * A[col][c]

    theta = [A[i][p] / A[i][i] for i in range(p)]
    return [theta[0] + theta[1] * row[0] + theta[2] * row[0] * row[0] for row in test_X]`,
    solutionNotes: [
      "Engineer x-squared as a second feature so one least-squares solver fits a curve.",
      "Build [1, x, x**2] per row and solve the same 3x3 normal equations used for a line.",
      "Predict with the fitted intercept and both coefficients on every test row.",
      "The labels are noisy, so R-squared settles near 0.94 rather than 1.0.",
    ],
  },
  {
    id: "lab-05",
    title: "K-Means Segmenter",
    category: "Clustering",
    difficulty: "Hard",
    blurb:
      "Four well-separated groups in feature space, each with its own target level. Cluster the training rows and predict a value per test row; predicting the global mean scores R-squared 0.00.",
    metric: "r2",
    higherIsBetter: true,
    baseline: 0,
    target: 0.9,
    timeLimitSeconds: 900,
    constraints: [
      "Define predict(train_X, train_y, test_X) and return exactly one value per test row.",
      "Pure Python or numpy both run; no external data or network access.",
      "Return a numeric prediction for every test row.",
      "Cluster the training features into four groups; test labels are never passed to predict().",
    ],
    trainData: LAB_05_TRAIN,
    testData: LAB_05_TEST,
    starterCode: `def predict(train_X, train_y, test_X):
    # Baseline: predict the global mean across all clusters.
    # Replace with k-means cluster means, then return one value per test row.
    mean = sum(train_y) / len(train_y)
    return [mean for _ in test_X]`,
    hint:
      "Run k-means on train_X with k=4, then return each test point's nearest-cluster mean training label.",
    points: 50,
    solutionCode: `def predict(train_X, train_y, test_X):
    k = 4
    rows = len(train_X)
    cols = len(train_X[0])
    centroids = [list(train_X[i]) for i in range(k)]
    assign = [-1] * rows

    for _ in range(100):
        changed = False
        for i in range(rows):
            best = 0
            best_dist = None
            for c in range(k):
                dist = sum((train_X[i][j] - centroids[c][j]) ** 2 for j in range(cols))
                if best_dist is None or dist < best_dist:
                    best_dist = dist
                    best = c
            if assign[i] != best:
                assign[i] = best
                changed = True
        for c in range(k):
            members = [i for i in range(rows) if assign[i] == c]
            if members:
                centroids[c] = [sum(train_X[i][j] for i in members) / len(members) for j in range(cols)]
        if not changed:
            break

    overall = sum(train_y) / rows
    means = []
    for c in range(k):
        members = [i for i in range(rows) if assign[i] == c]
        means.append(sum(train_y[i] for i in members) / len(members) if members else overall)

    out = []
    for row in test_X:
        best = 0
        best_dist = None
        for c in range(k):
            dist = sum((row[j] - centroids[c][j]) ** 2 for j in range(cols))
            if best_dist is None or dist < best_dist:
                best_dist = dist
                best = c
        out.append(means[best])
    return out`,
    solutionNotes: [
      "Seed four centroids from the first four training rows, then run Lloyd's algorithm until assignments stop moving.",
      "Recompute each centroid as the mean of its members; empty clusters keep their old position.",
      "Predict with the mean training label of each test row's nearest centroid, never its test label.",
      "The four clouds are far apart, so a few iterations converge to R-squared near 0.98.",
    ],
  },
  {
    id: "lab-06",
    title: "Credit Default Detector",
    category: "Classification",
    difficulty: "Medium",
    blurb:
      "Only about a third of applicants default. F1 is measured for the default class, and predicting everyone as safe scores 0.00.",
    metric: "f1",
    higherIsBetter: true,
    baseline: 0,
    target: 0.85,
    timeLimitSeconds: 600,
    constraints: [
      "Define predict(train_X, train_y, test_X) and return exactly one value per test row.",
      "Pure Python or numpy both run; no external data or network access.",
      "Return a default probability or 0/1 label; values are thresholded at 0.5.",
      "F1 is computed for the default class (label 1).",
    ],
    trainData: LAB_06_TRAIN,
    testData: LAB_06_TEST,
    starterCode: `def predict(train_X, train_y, test_X):
    # Baseline: predict the majority class.
    # Replace with logistic regression, then return one value per test row.
    rate = sum(train_y) / len(train_y)
    label = 1 if rate > 0.5 else 0
    return [label for _ in test_X]`,
    hint:
      "Standardize the four features and fit logistic regression. Raising the decision threshold trades precision for recall.",
    points: 25,
    solutionCode: `import math


def predict(train_X, train_y, test_X):
    rows = len(train_X)
    cols = len(train_X[0])
    means = [sum(row[j] for row in train_X) / rows for j in range(cols)]
    stds = []
    for j in range(cols):
        var = sum((row[j] - means[j]) ** 2 for row in train_X) / rows
        stds.append(math.sqrt(var) if var > 0 else 1.0)

    def scale(row):
        return [(row[j] - means[j]) / stds[j] for j in range(cols)] + [1.0]

    X = [scale(row) for row in train_X]
    w = [0.0] * (cols + 1)
    rate = 0.5
    for _ in range(2000):
        grad = [0.0] * (cols + 1)
        for xi, y in zip(X, train_y):
            z = sum(w[j] * xi[j] for j in range(cols + 1))
            p = 1.0 / (1.0 + math.exp(-z))
            for j in range(cols + 1):
                grad[j] += (p - y) * xi[j]
        for j in range(cols + 1):
            w[j] -= rate * grad[j] / rows

    out = []
    for row in test_X:
        xi = scale(row)
        z = sum(w[j] * xi[j] for j in range(cols + 1))
        out.append(1.0 / (1.0 + math.exp(-z)))
    return out`,
    solutionNotes: [
      "Standardize the four features, then fit logistic regression with batch gradient descent.",
      "Return default probabilities; the harness thresholds any score at 0.5.",
      "With seven hidden defaults, six catches and no false alarms is enough; two mistakes miss.",
      "Predicting everyone as safe scores F1 0.00 no matter how accurate it looks.",
    ],
  },
  {
    id: "lab-07",
    title: "Robust Sensor Calibration",
    category: "Regression",
    difficulty: "Medium",
    blurb:
      "Two sensor readings predict a target, but a few training rows are corrupted by outliers. Lower is better: the training-mean baseline scores an MSE of 84.91.",
    metric: "mse",
    higherIsBetter: false,
    baseline: 84.91,
    target: 8,
    timeLimitSeconds: 600,
    constraints: [
      "Define predict(train_X, train_y, test_X) and return exactly one value per test row.",
      "Pure Python or numpy both run; no external data or network access.",
      "Return a numeric prediction for every test row.",
    ],
    trainData: LAB_07_TRAIN,
    testData: LAB_07_TEST,
    starterCode: `def predict(train_X, train_y, test_X):
    # Baseline: predict the mean training target.
    # Replace with a fitted regression, then return one value per test row.
    mean = sum(train_y) / len(train_y)
    return [mean for _ in test_X]`,
    hint:
      "Start with ordinary least squares on both sensors. If the outliers pull the fit, drop the largest-residual rows and refit.",
    points: 25,
    solutionCode: `def predict(train_X, train_y, test_X):
    def fit(X, y):
        p = len(X[0])
        A = [[0.0] * (p + 1) for _ in range(p)]
        for i in range(len(X)):
            for j in range(p):
                for k in range(p):
                    A[j][k] += X[i][j] * X[i][k]
                A[j][p] += X[i][j] * y[i]
        for col in range(p):
            pivot = col
            for r in range(col + 1, p):
                if abs(A[r][col]) > abs(A[pivot][col]):
                    pivot = r
            A[col], A[pivot] = A[pivot], A[col]
            for r in range(p):
                if r == col:
                    continue
                factor = A[r][col] / A[col][col]
                for c in range(col, p + 1):
                    A[r][c] -= factor * A[col][c]
        return [A[i][p] / A[i][i] for i in range(p)]

    def predict_row(theta, row):
        return sum(theta[j] * ([1.0] + list(row))[j] for j in range(len(theta)))

    X = [[1.0] + list(row) for row in train_X]
    theta = fit(X, train_y)
    residuals = [abs(predict_row(theta, row) - y) for row, y in zip(train_X, train_y)]
    cutoff = 3.0 * (sum(residuals) / len(residuals))
    keep = [i for i in range(len(train_X)) if residuals[i] <= cutoff]
    if len(keep) >= len(theta):
        theta = fit([X[i] for i in keep], [train_y[i] for i in keep])
    return [predict_row(theta, row) for row in test_X]`,
    solutionNotes: [
      "Fit ordinary least squares on all 28 rows, then look at the residual of each training row.",
      "Drop rows whose absolute residual is more than three times the mean residual.",
      "Refit on the clean rows only; three corrupted labels were bending the surface.",
      "The screened fit drops hidden MSE to well under one, far below the target of 8.",
    ],
  },
  {
    id: "lab-08",
    title: "XOR Boundary",
    category: "Classification",
    difficulty: "Hard",
    blurb:
      "An XOR label over two features: no linear boundary beats 0.75 accuracy. Reach 0.90 on held-out rows with an engineered interaction.",
    metric: "accuracy",
    higherIsBetter: true,
    baseline: 0.75,
    target: 0.9,
    timeLimitSeconds: 900,
    constraints: [
      "Define predict(train_X, train_y, test_X) and return exactly one value per test row.",
      "Pure Python or numpy both run; no external data or network access.",
      "Return probabilities or 0/1 labels; values are thresholded at 0.5.",
      "The two raw features alone cannot reach the target.",
    ],
    trainData: LAB_08_TRAIN,
    testData: LAB_08_TEST,
    starterCode: `def predict(train_X, train_y, test_X):
    # Baseline: predict the majority class.
    # Replace with an interaction model, then return one value per test row.
    rate = sum(train_y) / len(train_y)
    label = 1 if rate > 0.5 else 0
    return [label for _ in test_X]`,
    hint:
      "Add x1 times x2 as a third feature (x1-squared and x2-squared can help too), standardize, and fit logistic regression.",
    points: 50,
    solutionCode: `import math


def predict(train_X, train_y, test_X):
    rows = len(train_X)

    def features(row):
        return [row[0], row[1], row[0] * row[1]]

    raw = [features(row) for row in train_X]
    means = [sum(r[j] for r in raw) / rows for j in range(3)]
    stds = []
    for j in range(3):
        var = sum((r[j] - means[j]) ** 2 for r in raw) / rows
        stds.append(math.sqrt(var) if var > 0 else 1.0)

    def scale(row):
        r = features(row)
        return [(r[j] - means[j]) / stds[j] for j in range(3)] + [1.0]

    X = [scale(row) for row in train_X]
    w = [0.0] * 4
    rate = 0.5
    for _ in range(3000):
        grad = [0.0] * 4
        for xi, y in zip(X, train_y):
            z = sum(w[j] * xi[j] for j in range(4))
            p = 1.0 / (1.0 + math.exp(-z))
            for j in range(4):
                grad[j] += (p - y) * xi[j]
        for j in range(4):
            w[j] -= rate * grad[j] / rows

    out = []
    for row in test_X:
        xi = scale(row)
        z = sum(w[j] * xi[j] for j in range(4))
        out.append(1.0 / (1.0 + math.exp(-z)))
    return out`,
    solutionNotes: [
      "Add the interaction x1*x2 as a third feature, then standardize all three columns.",
      "Fit logistic regression on [x1, x2, x1*x2] with batch gradient descent.",
      "The interaction is positive exactly in the two label-1 quadrants, so the boundary turns diagonal.",
      "The raw features alone cap out near 0.75 accuracy, which is the baseline and the linear ceiling.",
    ],
  },
];
