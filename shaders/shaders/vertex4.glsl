uniform vec4 uFrequency;
uniform float uTime;

varying vec4 vFrequency;
varying float vTime;
varying vec2 vUv;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  vUv = uv;
  vTime = uTime;
  vFrequency = uFrequency;
}