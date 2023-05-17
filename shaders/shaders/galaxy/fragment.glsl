
varying vec3 vColor;

void main() {

  // Disc
  float strength = 1.0 - step(0.5, distance(gl_PointCoord, vec2(0.5)));

  // Diffuse Point
  // float strength = distance(gl_PointCoord, vec2(0.5));
  // strength *= 2.0;
  // strength = 1.0 - strength;

  // Light Point Value
  // float strength = 1.0 - distance(gl_PointCoord, vec2(0.5));
  // strength = pow(strength, 10.0);

  // final color
  vec3 color = mix(vec3(0.0), vColor, strength);

  gl_FragColor = vec4(color, 1.0);
}