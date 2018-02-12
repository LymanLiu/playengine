import createShader from "../shader";

const vshader = `
attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 matrix_view;
uniform mat4 matrix_model;
uniform mat3 matrix_normal;
uniform mat4 matrix_viewProjection;

varying vec3 vNormal;

void main(void) {
    vNormal = mat3(matrix_view) * matrix_normal * aNormal;
    gl_Position = matrix_viewProjection * matrix_model * vec4(aPosition, 1.0);
}
`;

const fshader = `
varying vec3 vNormal;

void main(void) {
  vec3 normalViewColor = normalize(vNormal) * 0.5 + 0.5;
  gl_FragColor  = vec4(normalViewColor, 1.0);
}
`;

const shaderDefinition = {
    attributes: {
        aPosition: pc.SEMANTIC_POSITION,
        aNormal: pc.SEMANTIC_NORMAL
    },
    vshader,
    fshader
};

export default createShader(shaderDefinition);
