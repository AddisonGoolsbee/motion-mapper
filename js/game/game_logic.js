import {refresh_displays} from "../utils/utils_three.js";

let SECONDS_PER_GAME = 60

export const spawn_sphere = (engine) => {
    let sphere = engine.draw_debug_sphere([1,0,1], 0.05, 0x00ff00, 0.8, 10)
    let new_position = randomPointInEllipsoid()
    sphere.position.set(...new_position)
    return sphere
}

export const relocate_sphere = (sphere, score, settings, gui) => {
    let new_position = randomPointInEllipsoid()
    sphere.position.set(...new_position)
    score++;
    settings.score = score
    refresh_displays(gui)
    return score
}

export const handle_collision = (current_sphere, position, score, settings, gui) => {
    let x = current_sphere.position.x
    let y = -current_sphere.position.z
    let z = current_sphere.position.y
    let distance = Math.sqrt(Math.pow(x - position[0], 2) + Math.pow(y - position[1], 2) + Math.pow(z - position[2], 2))
    if (distance < 0.07) {
        score = relocate_sphere(current_sphere, score, settings, gui)
    }
    return score
}

// generate a random new position for the point sphere. Point is generated based on hard-coded possible end-positions of the arm
function randomPointInEllipsoid() {
    const XMIN = -0.8
    const XMAX = 0.7
    const YMIN = -1.05
    const YMAX = 1.05
    const ZMIN = -0.35
    const ZMAX = 1.05

    let a = Math.abs(XMAX - XMIN) / 2;
    let b = Math.abs(YMAX - YMIN) / 2;
    let c = Math.abs(ZMAX - ZMIN) / 2;

    let x0 = XMIN + a;
    let y0 = YMIN + b;
    let z0 = ZMIN + c;

    let u = Math.random();
    let v = Math.random();
    let theta = 2 * Math.PI * u;
    let phi = Math.acos(2 * v - 1);
    let r = Math.cbrt(Math.random()); 

    let x = x0 + a * r * Math.sin(phi) * Math.cos(theta);
    let y = y0 + b * r * Math.sin(phi) * Math.sin(theta);
    let z = z0 + c * r * Math.cos(phi);

    return [x, z, y];
}

let lastTime = Date.now();

export const handle_timer = (settings, seconds_left, gui, actions) => {
    let now = Date.now();
    let deltaTime = (now - lastTime) / 1000;

    if (deltaTime >= 1) {
        seconds_left--;
        if (seconds_left <= 0) {
            actions.reset()
            seconds_left = SECONDS_PER_GAME
        }
        settings.time = `0:${seconds_left.toString().padStart(2, '0')}`
        refresh_displays(gui)
        lastTime = now; 
    }
    return seconds_left
}