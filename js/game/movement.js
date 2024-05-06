const MOVEMENT_SPEED = 0.03;

let wIsPressed = false;
let aIsPressed = false;
let sIsPressed = false;
let dIsPressed = false;
let spaceIsPressed = false;
let shiftIsPressed = false;

document.addEventListener('keydown', function(event) {
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

document.addEventListener('keyup', function(event) {
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

    if (wIsPressed) {
        position[0] -= MOVEMENT_SPEED;
    }
    if (aIsPressed) {
        position[1] -= MOVEMENT_SPEED;
    }
    if (sIsPressed) {
        position[0] += MOVEMENT_SPEED;
    }
    if (dIsPressed) {
        position[1] += MOVEMENT_SPEED;
    }
    if (spaceIsPressed) {
        position[2] += MOVEMENT_SPEED;
    }
    if (shiftIsPressed) {
        position[2] -= MOVEMENT_SPEED;
    }
    return position
}