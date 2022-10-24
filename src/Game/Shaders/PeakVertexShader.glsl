uniform vec2 uFrequency;
uniform float uTime;
uniform sampler2D uTexture;
uniform float bumpScale;

varying vec2 vUv;
varying float vAmount;

void main()
{
    vUv = uv;
    vec4 bumpData = texture2D( uTexture, uv );

    vAmount = bumpData.b; // assuming map is grayscale it doesn't matter if you use r, g, or b.

    // move the position along the normal
    vec3 newPosition = position + normal * bumpScale * vAmount * 1.4;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
//    vUV = uv;
}