let canvas = document.getElementById("canvas");
let [w, h] = [window.innerWidth - 100, window.innerHeight - 100];

let requestID, requestIDclear;
let [angle, scale] = [0, 0];
let [scanAnimation, animCenter, animSides] = [1.01, 0, 0];
let rotated3dmassive = [];
let newMatrixMassive = [];
let stopAnimate = false;
let lineSelected, currentLines;

let scan = document.getElementById('scan');
let newCoordinatesUser = document.getElementById("new-user-coordinates");
let rotate_buttons = document.querySelectorAll(".button_rotate");
let xz = 0;
let distance = 3;
let prevA = 0;
let cubeWminus = [];
let button_new_coordinates = document.getElementById('new_coordinates');
let v, global_w, global_z;

let l, new_coordinates;
let rotation_matrixes = [[0, 1], 0, 0, 0, 0, [2, 3]];
let mass = [[0, 1], [1, 2], [2, 3], [0, 2], [0, 3], [1, 3]];
let new_points = [];
let massiveButtonsRotate = [true, false, false, false, false, true];
let defaultRotation = document.getElementById('default');


defaultRotation.addEventListener("click", function () {

  if (massiveButtonsRotate[0] == true && massiveButtonsRotate[5] == true) {

    defaultRotation.style.backgroundColor = '#eaeaea';
    defaultRotation.style.color = '#5ca03b';
    rotation_matrixes[0] = 0;
    rotation_matrixes[5] = 0;
    massiveButtonsRotate[0] = false;
    massiveButtonsRotate[5] = false;

  } else {
 
    massiveButtonsRotate[0] = true;
    massiveButtonsRotate[5] = true;
    rotation_matrixes[0] = rotation_matrixes4d[0].getP();
    rotation_matrixes[0] = rotation_matrixes4d[5].getP();
    defaultRotation.style.backgroundColor = '#7EAE5F';
    defaultRotation.style.color = '#C0FFCD';
  }

}
);
class Rotation4D {
  constructor(p1, p2, plane) {

    this.p1 = p1;
    this.p2 = p2;
    this.plane = plane;
  }
  getSize() {
    return 4;
  }
  getP() {
    return [this.p1, this.p2];
  }
  getPlane() {
    return this.plane;
  }
}

function mainfunc() {
  var canvas = document.getElementById("canvas");
  var context = canvas.getContext('2d');
  canvas.style.backgroundColor = "black";
  canvas.width = w;
  canvas.height = h;
  animate();
}

function buildLine() {
  let xn = colorLines()[0];
  let yn = colorLines()[1];
  drawLines(xn, yn, true);

}


function colorLines() {
  var e = e || window.event;
  let newMatrix = JSON.parse(JSON.stringify(newMatrixMassive));
  var targetCoords = canvas.getBoundingClientRect();
  var x = e.clientX - targetCoords.left;
  var y = e.clientY - targetCoords.top;
  let x0, y0, x1, y1, dataX, dataY;
  for (let i = 0; i < v.length; i++) {
    x0 = Math.round(newMatrix[v[i][0]][0][0] * w / 2 + w / 2);
    y0 = Math.round(newMatrix[v[i][0]][1][0] * w / 2 + h / 2);
    x1 = Math.round(newMatrix[v[i][1]][0][0] * w / 2 + w / 2);
    y1 = Math.round(newMatrix[v[i][1]][1][0] * w / 2 + h / 2);
    dataX = [x0, x1];
    dataY = [y0, y1];
    if (Math.abs((x - x0) / (x1 - x0) - (y - y0) / (y1 - y0)) <= 0.03 && Math.min(x0, x1) <= x && Math.max(x0, x1) >= x && Math.min(y0, y1) <= y && Math.max(y0, y1) >= y) {
      lineSelected = v[i];
      drawPoints(newMatrix[v[i][0]], true);
      drawPoints(newMatrix[v[i][1]], true);
      
      return ([newMatrix[v[i][0]], newMatrix[v[i][1]]]);
      

    }
  }
}

button_new_coordinates.addEventListener("click", function () {
  new_coordinates = document.querySelectorAll(".coordinates");
  let new_user_point = [];
  for (let i = 0; i < new_coordinates.length; i++) {

    // if (new_coordinates[i].value.length == 0){
    //   throw new Error('Не хватает значений!');
    // }
    new_user_point.push(Number(new_coordinates[i].value));
  }
  new_points.push(new_user_point);

}
);
let rotation_matrixes4d = [new Rotation4D(0, 1, 'xy'), new Rotation4D(0, 2, 'xz'), new Rotation4D(0, 3, 'xw'), new Rotation4D(1, 2, 'yz'), new Rotation4D(1, 3, 'yw'), new Rotation4D(2, 3, 'zw')];



rotate_buttons.forEach(function (rotate, i) {
  let id_rotate = rotate.getAttribute('id');
  for (let j = 0; j < rotation_matrixes4d.length; j++) {
    if (rotation_matrixes4d[j].getPlane() == id_rotate) {

      rotate.addEventListener("click", function () {

        if (massiveButtonsRotate[j] == true) {


          rotate.style.backgroundColor = '#eaeaea';
          rotate.style.color = '#5ca03b';
          rotation_matrixes[j] = 0;
          massiveButtonsRotate[j] = false;

        } else {
          
          massiveButtonsRotate[j] = true;
          rotation_matrixes[j] = rotation_matrixes4d[j].getP();
          rotate.style.backgroundColor = '#7EAE5F';
          rotate.style.color = '#C0FFCD';
      
        }

      }
      );
    }
  }

})

canvas.addEventListener('click', function () {
  buildPoint();

});

scan.addEventListener("click", function () {
  unfoldingShape()
});


canvas.addEventListener('click', function () {
  coordinatesNum();

});

canvas.addEventListener('click', function () {
  buildLine();
});

canvas.addEventListener('wheel', function (e) {
  e = e || window.event;
  scale += e.deltaY;
  matrixAnimation();
});


var context = canvas.getContext('2d');
var stopanimation = function () {
  stopAnimate = true;

  cancelAnimationFrame(requestID);
  cancelAnimationFrame(requestIDclear);

  matrixAnimation();


}

var mainPointsTarget = function () {
  var e = window.event || e;
  var newMatrix = newMatrixMassive;
  var targetCoords = canvas.getBoundingClientRect();
  var x = e.clientX - targetCoords.left;
  var y = e.clientY - targetCoords.top;
  for (let i = 0; i < newMatrix.length; i++) {
    if ((Math.abs(x - Math.round(newMatrix[i][0][0] * w / 2 + w / 2)) <= 10) && (Math.abs(y - Math.round(newMatrix[i][1][0] * w / 2 + h / 2)) <= 10)) {
      drawPoints(newMatrix[i], true);
      break;
    }
  }
}

function coords4d(n, r, maxCoords, minCoords, point1, point2,coords, gVect, dist ){
  let coordsA = [];
  for (let i = minCoords[n]; i<=maxCoords[n]; i += 0.01){
    if (coords.length != 0){
      for (let j = 0; j<coords[0].length; j++){
        if ((coords[0][j] - (i-point1[n][0])/gVect[n])<0.01){
          coordsA.push(coords[0][j] - (i-point1[n][0])/gVect[n]);
          dist.push([dist[j], i]);
        }
      } 
      }else{
        coordsA.push((i-point1[n][0])/gVect[n]);
        dist.push(i);
    }
  }
coords.shift();
coords.push(coordsA);

if (n == 0){
  let m= [];
  for (let i =0; i< dist.length; i++){
    if (dist[i].length == r){
      m.push(dist[i]);
    }
   
  }
  return m;
}
return coords4d(n-1,r, maxCoords, minCoords, point1, point2 , coords, gVect, dist);
}

function searchPoint(m){
  let n = 4;
  let point1, point2;
  let gVect = [];
  let max_coords = [];
  let min_coords = [];
  let matrix = Array.from(Array(2 ** n), () => new Array(n));
  let arraySpinMatrix  = [0,0,0,0,0,0];
  let arrayStabMatrix = [0,0,0,0,0,0];
  let zero = [];
  let dCoords = [];
  
  matrix = matrixPointsCombinations(n, matrix);
  console.log( matrix );
  if (lineSelected != undefined){
    for (let i = 0; i < rotation_matrixes.length; i++) {
      if (rotation_matrixes[i] != 0) {
      arraySpinMatrix[i] = spinMatrix(4, rotation_matrixes[i][0], rotation_matrixes[i][1], angle);
      }}
   
    point1 = stringToСolumn(matrix[lineSelected[0]]);
    point2 = stringToСolumn(matrix[lineSelected[1]]);
    point1  = projectPoint4(point1, spinMatrix(4,0,2,angle), spinMatrix(3,1,2,angle), true, arraySpinMatrix, arrayStabMatrix)[1];
    point2  = projectPoint4(point2, spinMatrix(4,0,2,angle), spinMatrix(3,1,2,angle), true, arraySpinMatrix, arrayStabMatrix)[1];
    
  
     
    for(let i = 0; i< 4; i++){
      
     if (Math.max(point1[i][0], point2[i][0]) != Math.min(point1[i][0], point2[i][0])){
      gVect.push(point2[i][0]- point1[i][0]);
      max_coords.push(Math.max(point1[i][0], point2[i][0]));
      min_coords.push(Math.min(point1[i][0], point2[i][0]));
     }else{
      zero.push([point1[i][0], i]);
     }
    }
    dCoords = coords4d(max_coords.length-1,max_coords.length,max_coords, min_coords, point1, point2, [], gVect, []);
    let res = dCoords.map((item) => {
      for (let i = 0; i< zero.length; i++){
        item.splice(zero[i][1], 0, zero[i][0]);
      }
      return item;
    })

   let new_a;
   for(let i = 0; i<res.length; i++){
    new_a = stringToСolumn(res[i]);
    new_a = projectPoint4(new_a, spinMatrix(4,0,2,angle), spinMatrix(3,1,2,angle), true, arraySpinMatrix, true, arrayStabMatrix)[0];
    if (Math.abs( (new_a[1][0] - m[1][0]) < 0.05 && Math.abs(new_a[0][0] - m[0][0])< 0.05)){
      console.log('success');
    } }}}

function buildPoint() {
  var e = window.event || e;

  var targetCoords = canvas.getBoundingClientRect();
  var x = e.clientX - targetCoords.left;
  var y = e.clientY - targetCoords.top;
  let [x1, x2, y1, y2] = [Math.round(newMatrixMassive[lineSelected[0]][0] * w / 2 + w / 2), Math.round(newMatrixMassive[lineSelected[1]][0] * w / 2 + w / 2), Math.round(newMatrixMassive[lineSelected[0]][1] * w / 2 + h / 2), Math.round(newMatrixMassive[lineSelected[1]][1] * w / 2 + h / 2)];
  let newPointX, newPointY, newPoints;
  var min_x0 = Math.min(x1, x2);
  var min_y0 = Math.min(y1, y2);
  var max_x0 = Math.max(x1, x2);
  var max_y0 = Math.min(y1, y2);
  let dm, dm_f;
  for (let x0 = min_x0; x0 <= max_x0; x0 += 1) {
    for (let y0 = min_y0; y0 <= max_y0; y0 += 1) {
      dm = Math.abs(((x - x1) / (x2 - x1)) - ((y - y1) / (y2 - y1)));
      if (dm < 0.05) {
        while (dm > 0.001) {
          dm_f = dm;
          dm = Math.abs(((x + 0.01 - x1) / (x2 - x1)) - ((y + 0.01 - y1) / (y2 - y1)));
          if (dm > dm_f) {
            dm = Math.abs(((x - 0.01 - x1) / (x2 - x1)) - ((y - 0.01 - y1) / (y2 - y1)));
            x -= 0.001;
            y -= 0.001;
          } else {
            x += 0.001;
            y += 0.001;
          }

        }
        newPoints = unitCoordinates(x, y);

        newPointX = newPoints[0];
        newPointY = newPoints[1];
      } else {

        newPointX = (newMatrixMassive[lineSelected[0]][0][0] + newMatrixMassive[lineSelected[1]][0][0]) / 2;
        newPointY = (newMatrixMassive[lineSelected[0]][1][0] + newMatrixMassive[lineSelected[1]][1][0]) / 2;
      }
    }
  }
  currentLines = [[newPointX], [newPointY]];
  drawPoints([[newPointX], [newPointY]], true);
  newCoordinatesUser.innerHTML += `По оси x: ${newPointX}, по оси y:${newPointY}`;
 searchPoint([[newPointX], [newPointY]]);
 

}


var continueanimation = function () {
  animate();
}

var unfoldingShape = function () {
  xz = 1;
}

function localCoordinates(x,y) {
  x = Math.round(x * w / 2 + w / 2);
  y = Math.round(y * w / 2 + h / 2);
  return [x, y];
}

function unitCoordinates(x, y) {
  x = (x - w / 2) / (w / 2);
  y = (y - h / 2) / (w / 2);
  return [x, y];
}

var button1 = document.getElementById('stop_animation');
var button2 = document.getElementById('continue_animation');
button1.addEventListener("click", stopanimation);
button2.addEventListener("click", continueanimation);

// анимация
function animate() {
  angle += 0.01;
  matrixAnimation();
  requestIDclear = requestAnimationFrame(clearPoint);
  requestID = requestAnimationFrame(animate);
}

// вычисление факториала числа 
function fact(n, s = 1) {
  if (n > 1) {
    s *= n;
    return f(n - 1, s);
  }
  else
    return s;
}

// соединение точек
function pointConnection(m) {
  let s = 0;
  let points = [];
  for (let i = 0; i < m.length - 1; i++) {
    for (let j = 1; j < m.length - i; j++) {
      for (let k = 0; k < m[i].length; k++) {
        if (m[i][k] == m[i + j][k]) {
          s += 1;
        }
      }
      if (s == (m[i].length - 1)) {
        points.push([i, i + j]);
      }
      s = 0;
    }
  }
  return points;
}

// создание точек n-мерного куба
function matrixPointsCombinations(n, m, l = 1) {
  let count = 0;
  for (let i = 0; i < 2 ** n; i++) {
    if (count == 1) {
      m[i][l - 1] = 1;
    } else {
      m[i][l - 1] = -1;
    }
    if (((i + 1) % (2 ** n / 2 ** l)) == 0 && count == 1) {
      count = 0;
    } else {
      if (((i + 1) % (2 ** n / 2 ** l)) == 0 && count == 0)
        count = 1;
    }
  }
  if (l == n)
    return m;
  else {
    return matrixPointsCombinations(n, m, l + 1);
  }
}

// вращение точек
function spinMatrix(n, p1, p2, a) {
  let m = Array.from(Array(n), () => new Array(n))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      m[i][j] = 0;
      if (i == j && (i != p1) && (i != p2)) {
        m[i][j] = 1;
      }
      if (i == j && (i == p1 || i == p2)) {
        m[i][j] = Math.cos(a);

      }
      if (i == p1 && j == p2) {
        m[i][j] = Math.sin(-a);
      }
      if (i == p2 && j == p1) {
        m[i][j] = Math.sin(a);
      }

    }
  }
  return m;
}

//проекция точки 4-хмерного пространства
function projectPoint4(vectorPoints, spinMatrix3dX, flag, arraySpinMatrix, arrayStabMatrix) {
  let w, rotatedMatrix, points3d, projectionMatrix3d, d;
  rotatedMatrix = vectorPoints;
  if (flag == true) {
      for (let i = 0; i < arraySpinMatrix.length; i++) {
        if (arraySpinMatrix[i] != 0) {
          rotatedMatrix = math.multiply(arraySpinMatrix[i], rotatedMatrix);
        }
      }
    prevA = angle;
  }
  else {

      for (let i = 0; i < arraySpinMatrix.length; i++) {
        if (arraySpinMatrix[i] != 0) {
          rotatedMatrix = math.multiply(arrayStabMatrix[i], rotatedMatrix);
        }}
  }

  w = 1 / (distance - rotatedMatrix[3][0]);
  d = rotatedMatrix[3][0];
  projectionMatrix3d = [[w, 0, 0, 0], [0, w, 0, 0], [0, 0, w, 0]];
  points3d = math.multiply(projectionMatrix3d, rotatedMatrix);
  return [projectPoint3(points3d, spinMatrix3dX, d, flag, prevA), rotatedMatrix];

}
//проекция точки 3-хмерного пространства
function projectPoint3(rotated3d, spinMatrix3dX, d, flag, prevA) {
  let points, projectionMatrix2d, z;
  rotated3dmassive.push(rotated3d);
  if (flag) {
    rotated3d = math.multiply(spinMatrix3dX, rotated3d);
  } else {
    spinMatrix3dX = spinMatrix(3, 1, 2, prevA);
    rotated3d = math.multiply(spinMatrix3dX, rotated3d);
  }

  z = 1 / (distance - (rotated3d[2][0] + d));
  projectionMatrix2d = [[z, 0, 0],
  [0, z, 0]];
  points = math.multiply(projectionMatrix2d, rotated3d);
  return points;
}

//переводит матрицу 1xn
function stringToСolumn(points) {
  let columnPoints = [];
  for (let i = 0; i < points.length; i++) {
    columnPoints.push([points[i]]);
  }
  return columnPoints;
}

function columnToString(points) {
  let stringPoints = [];
  for (let i = 0; i < points.length; i++) {
    stringPoints.push(points[i][0]);
  }
  return stringPoints;
}

function newPoint(point) {
  point = stringToСolumn(point);
  point = scaleMatrix(point);
  new_points.push(point);
}
function matrixAnimation() {

  let points = [];
  let spinMatrix3dX = spinMatrix(3, 1, 2, angle);
  let rotated4DMatrix;
  let matrixSize = [[scanAnimation, 0], [0, scanAnimation]];
  let vectorPoints = [];
  let newMatrix = [];
  let n = 4;
  let pointsOfCube = Array.from(Array(2 ** n), () => new Array(n));
  pointsOfCube = matrixPointsCombinations(n, pointsOfCube);
  v = pointConnection(pointsOfCube);
  pointsOfCube = pointsOfCube.map((x) => scaleMatrix(x));
  let newMatrix3d = [];
  let centerOfCube = [0, 0];
  let cubesY, cubesZ, cube;
  let arrayCubesY = [];
  let arrayCubesZ = [];
  let arrayCube = [];
  let cubesYNew, cubesZNew, cubeNew;
  let rotatedCubesY = [];
  let rotatedCubesZ = [];
  let rotatedCube = [];
  let arraySpinMatrix = [0, 0, 0, 0, 0, 0];
  let arrayStabMatrix  = [0,0,0,0,0,0];
  let user_points = [];
  if (new_points.length != 0) {
    for (let i = 0; i < length; i++) {
      user_points = stringToСolumn(new_points[i]);
      user_points = scaleMatrix(user_points);
      user_points = projectPoint4(user_points, spinMatrix3dX, true, arraySpinMatrix, arrayStabMatrix)[0];
      drawPoints(user_points);
    }
  }
  for (let i = 0; i < rotation_matrixes.length; i++) {
    if (rotation_matrixes[i] != 0) {
      arraySpinMatrix[i] = spinMatrix(4, rotation_matrixes[i][0], rotation_matrixes[i][1], angle);
      arrayStabMatrix[ i] = spinMatrix(4, rotation_matrixes[i][0], rotation_matrixes[i][1], prevA); 
    }

  }
  for (let j = 0; j < pointsOfCube.length; j++) {
    if (rotated3dmassive.length > 15) {
      rotated3dmassive = [];
    }
    vectorPoints = stringToСolumn(pointsOfCube[j]);


    // не развертка
    if (xz == 0 || xz == 1 && Math.round(angle * 100) % 314 != 0) {
      points = projectPoint4(vectorPoints, spinMatrix3dX, true, arraySpinMatrix, arrayStabMatrix)[0];

    }

    // переход в развертку
    if (xz == 1) {
      if (Math.round(angle * 100) % (314) == 0) {
        xz = 2;
      }
    }
    // развертка
    if (xz == 2) {

      if (cubeWminus.length != 8) {
        points = projectPoint4(vectorPoints, spinMatrix3dX, false, arraySpinMatrix, arrayStabMatrix)[0];
        if ((Math.abs(centerOfCube[0] - points[0][0]) < 0.1) && Math.abs(centerOfCube[1] - points[1][0]) < 0.1) {
          points = math.multiply(matrixSize, points);
          cubeWminus.push(j);
        }
      }

      if (scanAnimation < 2) {
        scanAnimation += 0.001;
      }


      rotated4DMatrix = projectPoint4(vectorPoints, spinMatrix3dX, false, arraySpinMatrix, arrayStabMatrix)[1];

      if (animCenter < 2) {
        animCenter += 0.001;
      }

      if (animCenter >= 2 && animSides < 2) {
        animSides += 0.001;
      }
      if (Math.round(rotated4DMatrix[3][0]) == 1) {
        for (let i = 0; i < 8; i++) {
          for (let k = 0; k < v.length; k++) {
            if ((v[k][0] == j || v[k][1] == j) && (v[k][0] == cubeWminus[i] || v[k][1] == cubeWminus[i])) {

              vectorPoints[3][0] += animCenter;
              cubesY = JSON.parse(JSON.stringify(vectorPoints));
              cubesZ = JSON.parse(JSON.stringify(vectorPoints));
              cube = JSON.parse(JSON.stringify(vectorPoints));

              if (cube[1][0] == 1) {
                cube[1][0] += animSides * 2;
              }
              if (vectorPoints[0][0] == 1) {
                vectorPoints[0][0] += animSides;
              }

              if (vectorPoints[0][0] == -1) {
                vectorPoints[0][0] -= animSides;
              }

              if (cubesY[1][0] == -1) {
                cubesY[1][0] -= animSides;
              }

              if (cubesY[1][0] == 1) {
                cubesY[1][0] += animSides;
              }
              if (cubesZ[2][0] == -1) {
                cubesZ[2][0] -= animSides;
              }

              if (cubesZ[2][0] == 1) {
                cubesZ[2][0] += animSides;
              }

              cubesYNew = projectPoint4(cubesY, spinMatrix3dX, false, arraySpinMatrix, arrayStabMatrix)[0];
              cubesZNew = projectPoint4(cubesZ, spinMatrix3dX, false, arraySpinMatrix, arrayStabMatrix)[0];
              cubeNew = projectPoint4(cube, spinMatrix3dX, false, arraySpinMatrix, arrayStabMatrix)[0];
              // matrizaPerenosa = [[1, 0, 0, 0,0], [0, 1, 0, 0, 0], [0, 0, 1, 0, 0], [0,0,0,1, 0], [0,0,0,2,1]];
              drawPoints(cubesYNew);
              drawPoints(cubesZNew);
              drawPoints(cubeNew);
              arrayCube.push(columnToString(cube));
              arrayCubesY.push(columnToString(cubesY));
              arrayCubesZ.push(columnToString(cubesZ));
              rotatedCubesY.push(cubesYNew);
              rotatedCubesZ.push(cubesZNew);
              rotatedCube.push(cubeNew);



            }
          }
        }

      }

      points = projectPoint4(vectorPoints, spinMatrix3dX, false, arraySpinMatrix,arrayStabMatrix)[0];


    }


    drawPoints(points);
    newMatrix3d.push(pointsOfCube);
    newMatrix.push(points);
    points = [];
    vectorPoints = [];

  }
  let cubeYConnection = pointConnection(arrayCubesY);
  let cubeZConnection = pointConnection(arrayCubesZ);
  let cubeConnection = pointConnection(arrayCube);
  for (let i = 0; i < v.length; i++) {
    drawLines( newMatrix[v[i][0]], newMatrix[v[i][1]]);
  }

  for (let i = 0; i < cubeYConnection.length; i++) {
    drawLines( rotatedCubesY[cubeYConnection[i][0]], rotatedCubesY[cubeYConnection[i][1]]);
    drawLines( rotatedCubesZ[cubeZConnection[i][0]], rotatedCubesZ[cubeZConnection[i][1]]);
  }

  for (let i = 0; i < cubeConnection.length; i++) {

    drawLines( rotatedCube[cubeConnection[i][0]], rotatedCube[cubeConnection[i][1]])
  }

  newMatrix3d = [];

  newMatrixMassive = newMatrix;
  return newMatrix;




}

function scaleMatrix(m, x = 1 - scale / 1000, y = 1 - scale / 1000, z = 1 - scale / 1000, w = 1 - scale / 1000) {
  // clearPoint();
  console.log(scale, x);
  if (x <= 0) {
    x = 0;
    y = 0;
    z = 0;
    w = 0;
  }

  let sM = [[x, 0, 0, 0], [0, y, 0, 0], [0, 0, z, 0], [0, 0, 0, w]];
  m = math.multiply(sM, m);

  clearPoint();
  return m;



}

function drawPoints(points, isSelected = false) {
  points = localCoordinates(points[0][0],points[1][0]);
  context.beginPath();
  if (isSelected){
   context.fillStyle = 'green';
;
  }else{
    context.fillStyle = 'white';
  }
  context.arc(points[0],points[1], 7, 0, 2 * Math.PI);
  context.fill();
  context.closePath();
}

function drawLines(points1, points2,isTarget = false) {
  context.beginPath();
  if (isTarget == true){
    
    context.lineWidth = 5;
    context.strokeStyle = 'green';
  }else{
    context.lineWidth = 1;
    context.strokeStyle = 'white';
  }

  points2 = localCoordinates(points2[0][0], points2[1][0]);
  points1 = localCoordinates(points1[0][0], points1[1][0]);
  context.moveTo(points2[0], points2[1]);
  context.lineTo(points1[0], points1[1]);
  context.stroke();
  context.closePath();
}

function clearPoint() {
  var canvas = document.getElementById("canvas");
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
}



document.addEventListener('DOMContentLoaded', mainfunc, false);

