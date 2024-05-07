const MOVEMENT_SPEED = 0.06;
const FPS = 30;
const MS_PER_FRAME = 1000 / FPS;

let prev_time = performance.now();

let wIsPressed = false;
let aIsPressed = false;
let sIsPressed = false;
let dIsPressed = false;
let spaceIsPressed = false;
let shiftIsPressed = false;

window.addEventListener('keydown', function(event) {
    switch (event.key) {
        case 'w':
        case 'W':
            wIsPressed = true;
            break;
        case 'a':
        case 'A':
            aIsPressed = true;
            break;
        case 's':
        case 'S':
            sIsPressed = true;
            break;
        case 'd':
        case 'D':
            dIsPressed = true;
            break;
        case ' ':
            spaceIsPressed = true;
            break;
        case 'Shift':
            shiftIsPressed = true;
            break;
        default:
            break;
    }
});

window.addEventListener('keyup', function(event) {
    switch (event.key) {
        case 'w':
        case 'W':
            wIsPressed = false;
            break;
        case 'a':
        case 'A':
            aIsPressed = false;
            break;
        case 's':
        case 'S':
            sIsPressed = false;
            break;
        case 'd':
        case 'D':
            dIsPressed = false;
            break;
        case ' ':
            spaceIsPressed = false;
            break;
        case 'Shift':
            shiftIsPressed = false;
            break;
        default:
            break;
    }
});

export const updatePosition = (position) => {
    let curr_time = performance.now();
    let delta_time = curr_time - prev_time;
    let speed_multiplier = delta_time / MS_PER_FRAME;
    prev_time = curr_time;
    let lag_adjusted_speed = MOVEMENT_SPEED * speed_multiplier;
    console.log(lag_adjusted_speed)

    if (wIsPressed) {
        position[0] -= lag_adjusted_speed;
    }
    if (aIsPressed) {
        position[1] -= lag_adjusted_speed;
    }
    if (sIsPressed) {
        position[0] += lag_adjusted_speed;
    }
    if (dIsPressed) {
        position[1] += lag_adjusted_speed;
    }
    if (spaceIsPressed) {
        position[2] += lag_adjusted_speed;
    }
    if (shiftIsPressed) {
        position[2] -= lag_adjusted_speed;
    }
    return position
}