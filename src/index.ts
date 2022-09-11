import "styles/main.scss";
import Matter, { Body } from "matter-js";
import MatterAttractors from "matter-attractors";

Matter.use(MatterAttractors);

// Configuration
const Configs = {
    numBodies: 30,
    width: window.innerWidth,
    height: window.innerHeight,
    maxInitialDistance: 200,
};

function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

function initialize() {
    console.log("starting...");
    // create an engine
    const engine = Matter.Engine.create();
    engine.gravity.y = 0;

    // create a renderer
    const render = Matter.Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: Configs.width,
            height: Configs.height,
            showVelocity: true,
        },
    });

    const bodies = [];

    const midWidth = Configs.width / 2;
    const minX = midWidth - Configs.maxInitialDistance / 2;
    const maxX = midWidth + Configs.maxInitialDistance / 2;
    const midHeight = Configs.height / 2;
    const minY = midHeight - Configs.maxInitialDistance / 2;
    const maxY = midHeight + Configs.maxInitialDistance / 2;

    for (let i = 0; i < Configs.numBodies; i++) {
        const x = getRandomInRange(minX, maxX);
        const y = getRandomInRange(minY, maxY);
        const body = Matter.Bodies.circle(x, y, 5, {
            mass: 50,
            frictionAir: 0,
            collisionFilter: {
                group: 1,
            },
            plugin: {
                attractors: [MatterAttractors.Attractors.gravity],
            }
        });
        const velocity = Matter.Vector.create(
            getRandomInRange(-1, 1),
            getRandomInRange(-1, 1)
        );
        Body.setVelocity(body, velocity);
        bodies.push(body);
    }

    // add all of the bodies to the world
    Matter.Composite.add(engine.world, bodies);

    // run the renderer
    Matter.Render.run(render);

    // create runner
    const runner = Matter.Runner.create();

    // run the engine
    Matter.Runner.run(runner, engine);
}

initialize();