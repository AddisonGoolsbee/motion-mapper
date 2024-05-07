import {mul_matrix_matrix, add_matrix_matrix, sub_matrix_matrix, transpose, mul_matrix_scalar, frobenius_norm_matrix} from "../utils/utils_math.js"

// A must be a 3x3 matrix in row major order
// [[a11, a12, a13], [a21, a22, a23], [a31, a32, a33]]
function matrix_inverse_3x3(A) {
    let det = A[0][0] * (A[1][1] * A[2][2] - A[2][1] * A[1][2]) -
        A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
        A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);

    if (det === 0) {
        return null; // No inverse exists if determinant is 0
    }

    let cofactors = [
        [
            (A[1][1] * A[2][2] - A[2][1] * A[1][2]),
            -(A[1][0] * A[2][2] - A[1][2] * A[2][0]),
            (A[1][0] * A[2][1] - A[2][0] * A[1][1])
        ],
        [
            -(A[0][1] * A[2][2] - A[0][2] * A[2][1]),
            (A[0][0] * A[2][2] - A[0][2] * A[2][0]),
            -(A[0][0] * A[2][1] - A[2][0] * A[0][1])
        ],
        [
            (A[0][1] * A[1][2] - A[0][2] * A[1][1]),
            -(A[0][0] * A[1][2] - A[1][0] * A[0][2]),
            (A[0][0] * A[1][1] - A[1][0] * A[0][1])
        ]
    ];

    let adjugate = [
        [cofactors[0][0] / det, cofactors[1][0] / det, cofactors[2][0] / det],
        [cofactors[0][1] / det, cofactors[1][1] / det, cofactors[2][1] / det],
        [cofactors[0][2] / det, cofactors[1][2] / det, cofactors[2][2] / det]
    ];

    return adjugate;
}

const x = [[1], [0], [0]];
const y = [[0], [1], [0]];
const z = [[0], [0], [1]];
const center = [[0], [0], [0]];

const x_rotation = (theta) => {
    return [[1, 0, 0], [0, Math.cos(theta), -Math.sin(theta)], [0, Math.sin(theta), Math.cos(theta)]];
}

const y_rotation = (theta) => {
    return [[Math.cos(theta), 0, Math.sin(theta)], [0, 1, 0], [-Math.sin(theta), 0, Math.cos(theta)]];
}

const z_rotation = (theta) => {
    return [[Math.cos(theta), -Math.sin(theta), 0], [Math.sin(theta), Math.cos(theta), 0], [0,0,1]];
}

export const construct_SE3 = (m, translation) => {
    let SE3 = [[m[0][0], m[0][1], m[0][2], translation[0]],
                [m[1][0], m[1][1], m[1][2], translation[1]],
                [m[2][0], m[2][1], m[2][2], translation[2]],
                [0, 0, 0, 1]];
    return SE3;
}

const ln_SO3 = (m) => {
    let beta = Math.acos( (m[0][0] + m[1][1] + m[2][2] - 1.0) / 2.0 );

    if (beta === Math.PI) {
        // Pi case
        return [ [ 0.0, -Math.PI*Math.sqrt(0.5 * (m[2][2] + 1)), Math.PI*Math.sqrt(0.5 * (m[1][1] + 1)) ],
                [ Math.PI*Math.sqrt(0.5 * (m[2][2] + 1)), 0.0, -Math.PI*Math.sqrt(0.5 * (m[0][0] + 1)) ],
                [ -Math.PI*Math.sqrt(0.5 * (m[1][1] + 1)), Math.PI*Math.sqrt(0.5 * (m[0][0] + 1)), 0.0 ]
                ]
    } else if (Math.abs(beta) < 0.0001) {
        // taylor sereies approx. at 0
        let m1 = sub_matrix_matrix(m, transpose(m));
        let m2 = 0.5 + Math.pow(beta, 2) / 12.0 + 7.0 * Math.pow(beta, 4) / 720.0;
        return mul_matrix_scalar(m1, m2);
    } else {
        // normal case
        let m1 = sub_matrix_matrix(m, transpose(m));
        let m2 = beta / (2.0 * Math.sin(beta));
        return mul_matrix_scalar(m1, m2);
    }
}

export const calculate_distance = (m1, m2) => {
    // find displacement between the two elements (m1^-1 * m2)
    let m1_inv = numeric.inv(m1)
    let disp = mul_matrix_matrix(m1_inv, m2)

    // find ln of disp
    let SO3 = [
        [disp[0][0], disp[0][1], disp[0][2]],
        [disp[1][0], disp[1][1], disp[1][2]],
        [disp[2][0], disp[2][1], disp[2][2]]
    ];
    let t = [[disp[0][3]], [disp[1][3]], [disp[2][3]]];

    // solve for a1 a2 a3 using ln(SO3)
    let so3 = ln_SO3(SO3);
    let a1 = so3[2][1]
    let a2 = so3[0][2]
    let a3 = so3[1][0]

    // solve for p and q
    let beta = frobenius_norm_matrix([so3[2][1], so3[0][2], 1]);
    let p, q;
    if (Math.abs(beta) < 0.000001) {
        // taylor series approx.
        p = 0.5 - (Math.pow(beta, 2 ) /24) + (Math.pow(beta, 4) / 720);
        q = (1.0/6.0) - (Math.pow(beta, 2) / 120) + (Math.pow(beta, 4) / 5040);
    } else {
        // normal
        p = (1 - Math.cos(beta)) / Math.pow(beta, 2);
        q = (beta - Math.sin(beta)) / Math.pow(beta, 3);
    }

    // solve for a4 a5 a6
    let t_sol = [[1,0,0],[0,1,0],[0,0,1]]
    t_sol = add_matrix_matrix(t_sol, mul_matrix_scalar(so3, p));
    t_sol = add_matrix_matrix(t_sol, mul_matrix_scalar(mul_matrix_matrix(so3, so3), q));
    let t_sol_inv = matrix_inverse_3x3(t_sol);
    let a456 = mul_matrix_matrix(t_sol_inv, t);
    let a4 = a456[0][0]
    let a5 = a456[1][0]
    let a6 = a456[2][0]

    // find the euclidean distance
    let distance = Math.sqrt(a1*a1 + a2*a2 + a3*a3 + a4*a4 + a5*a5 + a6*a6)
    return distance
}