import "styles/main.scss";
import Matter, { Body } from "matter-js";
import MatterAttractors from "matter-attractors";

Matter.use(MatterAttractors);

// Configuration
const Configs = {
    numBodies: 3,
    width: window.innerWidth,
    height: window.innerHeight,
    maxInitialDistance: 200,
    bodyRadius: 5,
};

function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

function initialize() {
    console.log("starting simulation...");
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
    const trails = {};

    const midWidth = Configs.width / 2;
    const minX = midWidth - Configs.maxInitialDistance / 2;
    const maxX = midWidth + Configs.maxInitialDistance / 2;
    const midHeight = Configs.height / 2;
    const minY = midHeight - Configs.maxInitialDistance / 2;
    const maxY = midHeight + Configs.maxInitialDistance / 2;

    for (let i = 0; i < Configs.numBodies; i++) {
        const x = getRandomInRange(minX, maxX);
        const y = getRandomInRange(minY, maxY);
        const size = Configs.bodyRadius;
        const body = Matter.Bodies.circle(x, y, size, {
            mass: 40,
            frictionAir: 0,
            collisionFilter: {
                group: 1,
            },
            render: {
                opacity: 1,
                fillStyle: "#ffffff",
                strokeStyle: "#ffffff",
                lineWidth: 10,
            },
            plugin: {
                attractors: [MatterAttractors.Attractors.gravity],
            },
        });
        trails[body.id] = [];
        const velocity = Matter.Vector.create(
            getRandomInRange(-0.5, 0.5),
            getRandomInRange(-0.5, 0.5)
        );
        Body.setVelocity(body, velocity);
        bodies.push(body);
    }

    Matter.Events.on(render, 'afterRender', () => {
        bodies.forEach((body: Matter.Body) => {
            const position = body.position;
            const trail: Array<{position: Matter.Vector, speed: number}> = trails[body.id];
            trail.unshift({
                position: Matter.Vector.clone(position),
                speed: body.speed
            });

            render.context.globalAlpha = 0.7;

            for (let item of trail) {
                var point = item.position,
                    speed = item.speed;

                var hue = 250 + Math.round(Math.min(1, speed) * 170);
                render.context.fillStyle = 'hsl(' + hue + ', 100%, 55%)';
                render.context.fillRect(point.x, point.y, 1, 1);
            }
            
            render.context.globalAlpha = 1;
            render.context.fillStyle = 'white';
            render.context.beginPath();
                render.context.ellipse(
                position.x,
                position.y,
                Configs.bodyRadius,
                Configs.bodyRadius,
                0,
                2 * Math.PI,
                0
            );
            render.context.fill("nonzero");

            render.context.globalAlpha = 1;

            if (trail.length > 2000) {
                trail.pop();
            }
        });
    });

    // add repulsive borders
    const borderOptions = {
        mass: 1,
        frictionAir: 0,
        isStatic: true,
        collisionFilter: {
            group: 1,
        },
        render: {
            visible: false,
        },
        plugin: {
            attractors: [MatterAttractors.Attractors.gravity],
        },
    };
    const borders = [
        Matter.Bodies.rectangle(Configs.width / 2, 0, Configs.width, 5, borderOptions),
        Matter.Bodies.rectangle(Configs.width, Configs.height / 2, 5, Configs.height, borderOptions),
        Matter.Bodies.rectangle(Configs.width / 2, Configs.height, Configs.width, 5, borderOptions),
        Matter.Bodies.rectangle(0, Configs.height / 2, 5, Configs.height, borderOptions),
    ];

    // add all of the bodies to the world
    Matter.Composite.add(engine.world, bodies.concat(borders));

    // run the renderer
    Matter.Render.run(render);

    // create runner
    const runner = Matter.Runner.create();

    // run the engine
    Matter.Runner.run(runner, engine);
}

initialize();