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
    bodyMass: 50,
    maxTrailLength: 2000,
    maxTotalTrailParticles: 5000,
    initialSpeed: 0.3,
    initialSpeedRange: 0.1,
    initialAngleRange: 0.5 * Math.PI,
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
            hasBounds: true,
            width: Configs.width,
            height: Configs.height,
        },
    });

    const center = Matter.Vector.create(
        render.options.width / 2,
        render.options.height / 2
    );

    const bodies = [];
    const trails = {};

    const midWidth = Configs.width / 2;
    const minX = midWidth - Configs.maxInitialDistance / 2;
    const maxX = midWidth + Configs.maxInitialDistance / 2;
    const midHeight = Configs.height / 2;
    const minY = midHeight - Configs.maxInitialDistance / 2;
    const maxY = midHeight + Configs.maxInitialDistance / 2;

    const baseAngle = getRandomInRange(0, 2 * Math.PI);

    for (let i = 0; i < Configs.numBodies; i++) {
        const x = getRandomInRange(minX, maxX);
        const y = getRandomInRange(minY, maxY);
        const body = Matter.Bodies.circle(x, y, Configs.bodyRadius, {
            mass: Configs.bodyMass,
            restitution: 0.5,
            frictionAir: 0,
            collisionFilter: {
                group: 1,
            },
            render: {
                visible: false,
                opacity: 0,
                lineWidth: 0,
            },
            plugin: {
                attractors: [MatterAttractors.Attractors.gravity],
            },
        });
        trails[body.id] = [];
        const angle = baseAngle + getRandomInRange(
            -Configs.initialAngleRange / 2,
            Configs.initialAngleRange / 2
        );
        const speed = Configs.initialSpeed + getRandomInRange(
            -Configs.initialSpeedRange,
            Configs.initialSpeedRange
        );
        const velocity = Matter.Vector.rotate(
            Matter.Vector.mult(Matter.Vector.create(1, 1), speed),
            angle
        );
        Body.setVelocity(body, velocity);
        bodies.push(body);
    }

    Matter.Events.on(render, 'afterRender', () => {
        const avgX = bodies.map((body) => { return body.position.x })
                .reduce((a, b) => { return a + b }, 0) / bodies.length;
        const avgY = bodies.map((body) => { return body.position.y })
            .reduce((a, b) => { return a + b }, 0) / bodies.length;
        const centerOfMass = Matter.Vector.create(avgX, avgY);

        const translation = Matter.Vector.sub(center, centerOfMass);
        Matter.Bounds.translate(render.bounds, translation);

        bodies.forEach((body: Matter.Body) => {
            const position = body.position;
            const trail: Array<{position: Matter.Vector, speed: number}> = trails[body.id];
            trail.push({
                position: Matter.Vector.clone(position),
                speed: body.speed
            });

            render.context.globalAlpha = 1;

            for (let i = 0; i < trail.length; i++) {
                let item = trail[i];
                let point = item.position,
                    speed = item.speed;

                let hue = 250 + Math.round(Math.min(1, speed) * 170);
                render.context.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
                const max = trail.length / 4;
                render.context.globalAlpha = Math.min(i, max) / max;
                render.context.fillRect(point.x + translation.x, point.y + translation.y, 1, 1);
            }

            let trailLimit = Math.min(
                Configs.maxTrailLength,
                Configs.maxTotalTrailParticles / Configs.numBodies
            );
            
            if (trail.length > trailLimit) {
                trail.shift();
            }

            const hue = 250 + Math.round(Math.min(1, body.speed) * 170);
            render.context.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
            render.context.beginPath();
                render.context.ellipse(
                position.x + translation.x,
                position.y + translation.y,
                Configs.bodyRadius,
                Configs.bodyRadius,
                0,
                2 * Math.PI,
                0
            );
            render.context.fill("nonzero");
        });
    });

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