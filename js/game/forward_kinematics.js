import {mul_matrix_matrix, mul_matrix_scalar, add_matrix_matrix} from "../utils/utils_math.js";

const x = [ [0.07], [0], [0] ];
const y = [ [0], [0.07], [0] ];
const z = [ [0], [0], [0.07] ];

const exponentiate_so3 = (m) => {
    let epsilon = 1e-10;
    let beta = Math.sqrt(m[0][0] * m[0][0] + m[1][0] * m[1][0] + m[2][0] * m[2][0]);
    let p = beta > epsilon ? Math.sin(beta) / beta : Math.pow(beta, 2) / 6 + Math.pow(beta, 4) / 120;
    let q = beta > epsilon ? (1 - Math.cos(beta)) / (beta * beta) : 0.5 - Math.pow(beta, 2) / 24 + Math.pow(beta, 4) / 720;
    
    let m1 = numeric.identity(3);
    let m2 = mul_matrix_scalar(m, p);
    let m3 = mul_matrix_scalar(mul_matrix_matrix(m, m), q);
    let m_e = add_matrix_matrix(add_matrix_matrix(m1, m2), m3);
    return m_e;
}

const get_next_transformation = (joint, angle, prev_transformation) => {
    const T_i = prev_transformation;
    const T_c = joint.xyz_rpy_SE3_matrix;
    let T_j = numeric.identity(4);
    if (joint.joint_type_string === 'revolute') {
        let axis = joint.axis;
        let a = axis[0][0];
        let b = axis[1][0];
        let c = axis[2][0];
        let m = [[0, -c, b], [c, 0, -a], [-b, a, 0]];
        m = mul_matrix_scalar(m, angle);
        let m_e = exponentiate_so3(m);
        T_j = [[m_e[0][0], m_e[0][1], m_e[0][2], 0],
               [m_e[1][0], m_e[1][1], m_e[1][2], 0],
               [m_e[2][0], m_e[2][1], m_e[2][2], 0],
               [0, 0, 0, 1]];
    } else if (joint.joint_type_string === 'prismatic') {
        let axis = joint.axis;
        let translation = numeric.mul(axis, angle);
        T_j[0][3] = translation[0][0];
        T_j[1][3] = translation[1][0];
        T_j[2][3] = translation[2][0];
    }
    // if fixed, T_j remains as the identity matrix
    let T = mul_matrix_matrix(mul_matrix_matrix(T_i, T_c), T_j);
    return T
}

export const calculateForwardKinematics = (robot, engine, links, joints, joint_angles) => {
    let fk = [];
    let transformation = numeric.identity(4);
    let joint_count = 0;
    links.forEach(element => {
        if (joint_count >= joints.length) {
            return;
        }

        if (element.children_joint_idxs.length != 0) {
            // get joint
            let joint_idx = element.children_joint_idxs[0]
            let joint = joints[joint_idx];

            // get angle name
            if (joint.joint_type_string !== 'fixed') {           
                let angle = joint_angles[joint_count];
                transformation = get_next_transformation(joint, angle, transformation);
            }
        }

        fk.push(transformation)
        joint_count++;
        robot.set_link_mesh_pose_from_SE3_matrix(engine, element.link_idx + 1, transformation);
    });
    return fk
}