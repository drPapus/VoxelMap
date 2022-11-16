// https://www.shadertoy.com/view/ts2SWD
#define PI 3.1415926535897932384626433832795
#define SQRT3 1.7320508075688772

uniform vec3 uColor;
uniform float uSize;
uniform float uOpacity;

varying vec2 vUv;

vec2 rotate(vec2 uv, float rotation, vec2 mid)
{
    return vec2(
    cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
    cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
}

void main() {
    // vec2 u = vec2(200, 200);
    //vec2 R = vec2(1100, 1000), U = abs(vUv + vUv - R);
    //vec2 R = vec2(1, 1);
    //vec2 U = abs(vUv + vUv - R);
    //gl_FragColor =  vec4( U.x < min( .5*R ,R - U*1.7 ).y);
    //vec2 col = vec2(vUv.x * .5, vUv.y);
    //gl_FragColor = vec4(col, 0, 1);

    //////////////////////////// middle & squared
    vec2 iResolution = vec2(1, 1);
    vec2 rotatedUV = rotate(vUv, -PI * .5, vec2(0.5));
    vec2 uv = (rotatedUV - .5 * iResolution.xy)/iResolution.y;

    vec3 col = vec3(0);
    // vertical mirror
    uv = abs(uv);

    // skew 45
    float c = dot(uv,normalize(vec2(1, SQRT3)));

    // vertical sides
    c = max(c, uv.x);

    // width
    col += step(c, uSize);

    // Output to screen
    //vec3(.85, .85, .5)
    gl_FragColor = vec4(uColor, (vec3(1) - col) * uOpacity);
}