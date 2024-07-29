import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import BIRD_IMAGE from "./bird.png";
import ENEMY_IMAGE from "./enemy.png";
import GROUND_IMAGE from "./ground.jpeg";

const AngryBirdsGame = ({
  shouldRender,
  setShouldRender,
  setTimerScore,
  setStartTimer,
}) => {
  const sceneRef = useRef(null);
  setStartTimer(false);
  const [score, setScore] = useState(0);
  const [birdVelocity, setBirdVelocity] = useState({ x: 0, y: 0 });
  const [hasBeenLaunched, setHasBeenLaunched] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [imageAssets, setImageAssets] = useState({});

  useEffect(() => {
    const loadImages = () => {
      const birdImage = new Image();
      const enemyImage = new Image();
      const groundImage = new Image();
      let loadedImagesCount = 0;
      const totalImagesCount = 3;

      const onImageLoad = () => {
        loadedImagesCount += 1;
        if (loadedImagesCount === totalImagesCount) {
          setImagesLoaded(true);
        }
      };

      birdImage.onload = onImageLoad;
      enemyImage.onload = onImageLoad;
      groundImage.onload = onImageLoad;

      birdImage.onerror = () => setImagesLoaded(false);
      enemyImage.onerror = () => setImagesLoaded(false);
      groundImage.onerror = () => setImagesLoaded(false);

      birdImage.src = BIRD_IMAGE;
      enemyImage.src = ENEMY_IMAGE;
      groundImage.src = GROUND_IMAGE;

      setImageAssets({ birdImage, enemyImage, groundImage });
    };

    loadImages();
  }, []);

  useEffect(() => {
    if (!shouldRender || !imagesLoaded) return;

    const {
      Engine,
      Render,
      Runner,
      World,
      Bodies,
      Mouse,
      MouseConstraint,
      Constraint,
      Events,
    } = Matter;

    const engine = Engine.create();
    const world = engine.world;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: 800,
        height: 400,
        wireframes: false,
        background: "#87CEEB",
        showAngleIndicator: false,
      },
    });

    const { birdImage, enemyImage, groundImage } = imageAssets;

    // Create game area boundaries
    const wallThickness = 20;
    const groundBody = Bodies.rectangle(400, 390, 810, wallThickness, {
      isStatic: true,
      render: { sprite: { texture: groundImage.src } },
    });
    const leftWall = Bodies.rectangle(10, 200, wallThickness, 400, {
      isStatic: true,
    });
    const rightWall = Bodies.rectangle(790, 200, wallThickness, 400, {
      isStatic: true,
    });
    const topWall = Bodies.rectangle(400, 10, 810, wallThickness, {
      isStatic: true,
    });

    // Create the bird and slingshot
    const bird = Bodies.circle(150, 300, 20, {
      restitution: 0.5,
      render: {
        sprite: { texture: birdImage.src },
      },
    });
    const slingshotConstraint = Constraint.create({
      pointA: { x: 200, y: 300 },
      bodyB: bird,
      stiffness: 0.05,
      length: 0,
    });

    // Create stacked enemies
    const enemies = [];
    const baseY = 300;
    const enemyWidth = 30;
    const enemyHeight = 30;
    const stackWidth = 5;
    const stackHeight = 6;

    for (let i = 0; i < stackHeight; i++) {
      for (let j = 0; j < stackWidth; j++) {
        enemies.push(
          Bodies.rectangle(
            600 + j * (enemyWidth + 10),
            baseY - i * (enemyHeight + 10),
            enemyWidth,
            enemyHeight,
            {
              isStatic: false,
              restitution: 0.5,
              render: {
                sprite: { texture: enemyImage.src },
              },
            }
          )
        );
      }
    }

    // Add all bodies to the world
    World.add(world, [
      groundBody,
      leftWall,
      rightWall,
      topWall,
      bird,
      slingshotConstraint,
      ...enemies,
    ]);

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        render: { visible: false },
        stiffness: 0.1,
      },
    });

    World.add(world, mouseConstraint);

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    let isLaunched = false;

    const onMouseUp = () => {
      if (!isLaunched) {
        setTimeout(() => {
          World.remove(world, slingshotConstraint);
        }, 60);
        isLaunched = true;
        setHasBeenLaunched(true);
      }
    };

    const onCollision = (event) => {
      const pairs = event.pairs;
      pairs.forEach((pair) => {
        enemies.forEach((enemy, index) => {
          if (
            (pair.bodyA === bird && pair.bodyB === enemy) ||
            (pair.bodyB === bird && pair.bodyA === enemy)
          ) {
            World.remove(world, enemy);
            enemies.splice(index, 1);
            setScore((prevScore) => prevScore + 2);
          }
        });
      });
    };

    Events.on(mouseConstraint, "mouseup", onMouseUp);
    Events.on(engine, "collisionStart", onCollision);

    // Update bird velocity
    Events.on(engine, "afterUpdate", () => {
      if (isLaunched) {
        const velocity = bird.velocity;
        setBirdVelocity(velocity);
      }
    });

    return () => {
      Render.stop(render);
      World.clear(world);
      Engine.clear(engine);
      render.canvas.remove();
      render.canvas = null;
      render.context = null;
      render.textures = {};
    };
  }, [shouldRender, imagesLoaded, imageAssets]);

  useEffect(() => {
    if (hasBeenLaunched) {
      const interval = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [hasBeenLaunched]);

  useEffect(() => {
    if (
      (Math.abs(birdVelocity.x) < 1 &&
        Math.abs(birdVelocity.y) < 0.5 &&
        hasBeenLaunched) ||
      timeElapsed > 4
    ) {
      
      const timeout = setTimeout(() => {
        if (
          timeElapsed > 4 ||
          (Math.abs(birdVelocity.x) < 1 &&
            Math.abs(birdVelocity.y) < 0.5 &&
            hasBeenLaunched)
        ) {
          setTimerScore(score);
          
          setShouldRender(false);
        }
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [
    birdVelocity,
    score,
    setShouldRender,
    setTimerScore,
    hasBeenLaunched,
    timeElapsed,
  ]);

  return (
    <div>
      <div ref={sceneRef} />
      <div>Score: {score}</div>
    </div>
  );
};

export default AngryBirdsGame;
