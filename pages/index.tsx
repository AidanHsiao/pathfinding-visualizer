import Head from "next/head";
import React from "react";
import { useEffect, useState } from "react";
import styles from "../styles/styles.module.css";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Home() {
  const [matrixDimensions, setMatrixDimensions] = useState([15, 15]);
  const [startingPoint, setStartingPoint] = useState([0, 0]);
  const [endingPoint, setEndingPoint] = useState([14, 14]);
  const [animationSpeed, setAnimationSpeed] = useState(1.5);
  const [visualizerScale, setVisualizerScale] = useState(1);

  const [matrix, setMatrix] = useState(
    generateMatrix(matrixDimensions[1], matrixDimensions[0], "")
  );
  const [walls, setWalls] = useState<(number | string)[][]>([]);
  const [functionRunning, setFunctionRunning] = useState(false);
  const [placeType, setPlaceType] = useState("");
  const [solvedMatrix, setSolvedMatrix] = useState<(number | string)[][]>(
    generateMatrix(matrixDimensions[1], matrixDimensions[0], "")
  );

  function changeBlockType(row: number, col: number, bypass: boolean = false) {
    if (placeType !== "wall" && !bypass) return;
    const tempWalls = [...walls];
    const newWall = [row, col];
    let wallExists = false;
    wallExists = !tempWalls.every((wall) => {
      return JSON.stringify(newWall) !== JSON.stringify(wall);
    });
    if (wallExists) {
      const index = tempWalls.findIndex(
        (arr) => JSON.stringify(arr) === JSON.stringify([row, col])
      );
      tempWalls.splice(index, 1);
    } else {
      tempWalls.push([row, col]);
    }
    setWalls(tempWalls);
  }

  async function start() {
    if (functionRunning) return;
    setSolvedMatrix(generateMatrix(matrixDimensions[1], matrixDimensions[0]));
    runMatrixAnimation(
      matrixDimensions.slice().reverse(),
      startingPoint,
      endingPoint,
      walls
    );
  }

  async function reset() {
    setWalls([]);
    const [matrix] = matrixLogic(
      [matrixDimensions[1], matrixDimensions[0]],
      startingPoint,
      endingPoint,
      walls,
      0
    );
    setMatrix(matrix);
    setSolvedMatrix(matrix);
  }

  useEffect(() => {
    const [matrix] = matrixLogic(
      [matrixDimensions[1], matrixDimensions[0]],
      startingPoint,
      endingPoint,
      walls,
      0
    );
    setMatrix(matrix);
  }, [walls, matrixDimensions, startingPoint, endingPoint]);

  useEffect(() => {
    if (!window) return;
    window.addEventListener("mousedown", () => {
      setPlaceType("wall");
    });
    window.addEventListener("mouseup", () => {
      setPlaceType("");
    });
    window.addEventListener("resize", () => {
      const lesserValue = Math.min(window.innerWidth / 2, window.innerHeight);
    });
  }, []);

  async function runMatrixAnimation(size, startingPoint, endingPoint, walls) {
    setFunctionRunning(true);
    for (let i = 0; i < size[0] * size[1]; i++) {
      const [matrix, solvedMatrix, solved] = matrixLogic(
        size,
        startingPoint,
        endingPoint,
        walls,
        i
      );
      setMatrix(matrix);
      await sleep(40 / animationSpeed);
      if (solved) {
        setSolvedMatrix(solvedMatrix);
        break;
      }
    }
    setFunctionRunning(false);
  }

  return (
    <React.Fragment>
      <Head>
        <title>Pathfinding Visualizer</title>
      </Head>
      <main style={{ transform: `scale(${visualizerScale})` }}>
        <div className={styles.options}>
          <div className={styles.section}>
            <div onClick={() => start()} className={styles.button}>
              Start
            </div>
            <div onClick={() => reset()} className={styles.button}>
              Reset
            </div>
          </div>
          Visualizer cell width
          <input
            type="range"
            min={5}
            max={15}
            value={matrixDimensions[0]}
            onChange={(e) => {
              const tempDimensions = [...matrixDimensions];
              const tempStartingPoint = [...startingPoint];
              const tempEndingPoint = [...endingPoint];
              const val = parseInt(e.target.value);
              if (val < tempStartingPoint[0]) tempStartingPoint[0] = val;
              if (val < tempEndingPoint[0]) tempEndingPoint[0] = val;
              tempDimensions[0] = val;
              setStartingPoint(tempStartingPoint);
              setEndingPoint(tempEndingPoint);
              setMatrixDimensions(tempDimensions);
            }}
          />
          Visualizer cell height
          <input
            type="range"
            min={5}
            max={15}
            value={matrixDimensions[1]}
            onChange={async (e) => {
              const tempDimensions = [...matrixDimensions];
              const tempStartingPoint = [...startingPoint];
              const tempEndingPoint = [...endingPoint];
              const val = parseInt(e.target.value);
              if (val < tempStartingPoint[1]) tempStartingPoint[1] = val;
              if (val < tempEndingPoint[1]) tempEndingPoint[1] = val;
              tempDimensions[1] = val;
              setStartingPoint(tempStartingPoint);
              setEndingPoint(tempEndingPoint);
              setMatrixDimensions(tempDimensions);
            }}
          />
          <div className={styles.section} style={{ height: "auto" }}>
            <section>
              Starting Point X
              <input
                type="range"
                min={0}
                max={matrixDimensions[0] - 1}
                value={startingPoint[0]}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  const tempStartingPoint = [...startingPoint];
                  tempStartingPoint[0] = val;
                  setStartingPoint(tempStartingPoint);
                }}
              />
            </section>
            <section>
              Starting Point Y
              <input
                type="range"
                min={0}
                max={matrixDimensions[1] - 1}
                value={startingPoint[1]}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  const tempStartingPoint = [...startingPoint];
                  tempStartingPoint[1] = val;
                  setStartingPoint(tempStartingPoint);
                }}
              />
            </section>
          </div>
          <div className={styles.section} style={{ height: "auto" }}>
            <section>
              Ending Point X
              <input
                type="range"
                min={0}
                max={matrixDimensions[0] - 1}
                value={endingPoint[0]}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  const tempEndingPoint = [...endingPoint];
                  tempEndingPoint[0] = val;
                  setEndingPoint(tempEndingPoint);
                }}
              />
            </section>
            <section>
              Ending Point Y
              <input
                type="range"
                min={0}
                max={matrixDimensions[1] - 1}
                value={endingPoint[1]}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  const tempEndingPoint = [...endingPoint];
                  tempEndingPoint[1] = val;
                  setEndingPoint(tempEndingPoint);
                }}
              />
            </section>
          </div>
          Animation Speed
          <input
            type="range"
            min={0.5}
            max={2.5}
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
          />
        </div>
        <div className={styles.visualizer}>
          {matrix.map((row: (number | string)[], rowIdx: number) => {
            return (
              <div className={styles.row} key={`row_${rowIdx}`}>
                {row.map((value: number | string, colIdx: number) => {
                  return (
                    <div
                      className={styles.box}
                      key={`box_${rowIdx}_${colIdx}`}
                      style={{
                        backgroundColor:
                          typeof value === "number"
                            ? `hsl(${value * 9}, 100%, 40%)`
                            : value === "s"
                            ? "darkred"
                            : value === "x"
                            ? "black"
                            : value === ""
                            ? "gray"
                            : "darkgreen",
                        color:
                          typeof value === "string" ||
                          solvedMatrix[rowIdx][colIdx]
                            ? "white"
                            : "black",
                        textShadow: solvedMatrix[rowIdx][colIdx]
                          ? "2px 2px 10px black"
                          : "inherit",
                      }}
                      onMouseDown={() => changeBlockType(rowIdx, colIdx, true)}
                      onMouseOver={() => changeBlockType(rowIdx, colIdx)}
                    >
                      {value !== "x" ? value.toString().toUpperCase() : ""}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </main>
    </React.Fragment>
  );
}

function matrixLogic(
  size: number[],
  startingPoint: number[],
  endingPoint: number[],
  walls: (string | number)[][],
  step: number
): [(string | number)[][], (string | number)[][], boolean] {
  let breakpoint = 0;
  const matrixSize = size;
  let matrix = generateMatrix(matrixSize[0], matrixSize[1], "");

  function setPoints(matrix, startingPoint, endingPoint) {
    matrix[startingPoint[1]][startingPoint[0]] = "s";
    matrix[endingPoint[1]][endingPoint[0]] = "f";
    return matrix;
  }

  if (endingPoint[1] > matrixSize[0] - 1) {
    endingPoint[1] = matrixSize[0] - 1;
  }
  if (endingPoint[0] > matrixSize[1] - 1) {
    endingPoint[0] = matrixSize[1] - 1;
  }
  if (startingPoint[1] > matrixSize[0] - 1) {
    startingPoint[1] = matrixSize[0] - 1;
  }
  if (startingPoint[0] > matrixSize[1] - 1) {
    startingPoint[0] = matrixSize[1] - 1;
  }

  matrix = setPoints(matrix, startingPoint, endingPoint);

  function setWalls(matrix, walls) {
    walls.forEach((wall: number[]) => {
      const row = wall[0];
      const col = wall[1];
      matrix[row][col] =
        matrix[row][col] === "s" || matrix[row][col] === "f"
          ? matrix[row][col]
          : "x";
    });
    return matrix;
  }

  matrix = setWalls(matrix, walls);

  startingPoint = [startingPoint[1], startingPoint[0]];

  let tempPoints = [startingPoint];
  let tempPointsExist = true;

  for (let i = 0; i < step; i++) {
    const points = tempPoints;
    if (!points.length) {
      console.log("no more points.");
      tempPointsExist = false;
      break;
    }
    tempPoints = [];
    const found = points.every((point) => {
      const leftPoint = matrix[point[0]][Math.max(point[1] - 1, 0)];
      const rightPoint =
        matrix[point[0]][Math.min(point[1] + 1, matrixSize[1] - 1)];
      const upPoint = matrix[Math.max(point[0] - 1, 0)][point[1]];
      const downPoint =
        matrix[Math.min(point[0] + 1, matrixSize[0] - 1)][point[1]];
      if (point[1] > 0 && ["", "f"].includes(leftPoint))
        // Check left availability
        tempPoints.push([point[0], point[1] - 1]);
      if (point[1] < matrixSize[1] - 1 && ["", "f"].includes(rightPoint))
        // Check right availability
        tempPoints.push([point[0], point[1] + 1]);
      if (point[0] > 0 && ["", "f"].includes(upPoint))
        // Check up availability
        tempPoints.push([point[0] - 1, point[1]]);
      if (point[0] < matrixSize[0] - 1 && ["", "f"].includes(downPoint))
        // Check down availability
        tempPoints.push([point[0] + 1, point[1]]);
      const notFound = tempPoints.every((point) => {
        if (matrix[point[0]][point[1]] === "f") {
          breakpoint = i + 1;
          return false;
        }
        matrix[point[0]][point[1]] = i + 1;
        return true;
      });
      return notFound;
    });
    if (!found) break;
  }

  if (!breakpoint) return [matrix, matrix, !tempPointsExist];

  const solvedMatrix = generateMatrix(matrixSize[0], matrixSize[1], "");
  solvedMatrix[endingPoint[1]][endingPoint[0]] = breakpoint;
  let currentPoint = [endingPoint[1], endingPoint[0]];
  for (let i = breakpoint - 1; i >= 1; i--) {
    const leftPoint = matrix[currentPoint[0]][Math.max(currentPoint[1] - 1, 0)];
    const rightPoint =
      matrix[currentPoint[0]][Math.min(currentPoint[1] + 1, matrixSize[1] - 1)];
    const upPoint = matrix[Math.max(currentPoint[0] - 1, 0)][currentPoint[1]];
    const downPoint =
      matrix[Math.min(currentPoint[0] + 1, matrixSize[0] - 1)][currentPoint[1]];
    switch (i) {
      case leftPoint: {
        currentPoint = [currentPoint[0], currentPoint[1] - 1];
        break;
      }
      case rightPoint: {
        currentPoint = [currentPoint[0], currentPoint[1] + 1];
        break;
      }
      case upPoint: {
        currentPoint = [currentPoint[0] - 1, currentPoint[1]];
        break;
      }
      case downPoint: {
        currentPoint = [currentPoint[0] + 1, currentPoint[1]];
        break;
      }
    }
    solvedMatrix[currentPoint[0]][currentPoint[1]] = i;
  }
  solvedMatrix[startingPoint[0]][startingPoint[1]] = 0;
  return [matrix, solvedMatrix, true];
}

function generateMatrix(rowSize, colSize, defaultValue: any = 0) {
  return Array(rowSize)
    .fill(0)
    .map(() => Array(colSize).fill(defaultValue));
}
