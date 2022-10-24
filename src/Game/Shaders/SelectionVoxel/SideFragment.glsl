// https://www.shadertoy.com/view/Xt23WR
uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uTime;
uniform float uSpeed;
uniform float uWeight;
uniform float uTransparency;

varying vec2 vUv;

vec2 uv;

float GodRay(
    float scale,
    float threshold,
    float speed,
    float angle
) {
    float value = pow(
        sin((uv.x + uv.y * angle + (uTime * uSpeed) * speed) * scale),
        uWeight
    );
    value += float(threshold < value);
    return clamp(value, 0.0, 1.0);
}

void main() {
    uv = vUv / uResolution;
    float light = GodRay(22.0, 0.5, -0.003, 0.0) * 0.3;
    light += GodRay(47.0, 0.99, 0.02, 0.0) * 0.1;
    light += GodRay(25.0, 0.9, -0.01, 0.0) * 0.2;
    light += GodRay(52.0, 0.4, 0.0001, 0.0) * 0.1;
    light += GodRay(49.0, 0.4, 0.0003, 0.0) * 0.1;
    light += GodRay(57.0, 0.4, -0.0001, 0.0) * 0.1;
    light += GodRay(80.0, 0.8, -0.0001, 0.0) *	0.05;
    light -= pow((1.0 - uv.y) * 0.7, 0.8);
    light = max(light - uTransparency, 0.0);

    vec3 Color = light + uColor;
    gl_FragColor = vec4(Color, light);
}