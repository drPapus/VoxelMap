uniform float uPointSize;

varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( (position - normal * 0.001), 1.0 );
    gl_PointSize = uPointSize;
}