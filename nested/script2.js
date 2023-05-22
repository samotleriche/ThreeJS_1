import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

import fragmentShader from "../shaders/shaders/galaxy/fragment.glsl";
import vertexShader from "../shaders/shaders/galaxy/vertex.glsl";
import Stats from "stats.js";

// Stats
const stats = new Stats();
stats.showPanel(0);
stats.domElement.style.bottom = "0px";
stats.domElement.style.top = "auto";
document.body.appendChild(stats.dom);

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// close gui by default
gui.close();

// Canvas
const canvas = document.querySelector("canvas.webgl2");

// Scene
const scene = new THREE.Scene();

/**
 * galaxy
 */
const parameters = {
  count: 90_000,
  size: 0.02,
  radius: 4,
  branches: 3,
  spin: 0.5,
  randomness: 0.2,
  randomnessPower: 5,
  insideColor: "#ff6030",
  outsideColor: "#4a7af2",
  spinSpeed: 0.05,
};

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {
  console.log("generate galaxy");

  if (points !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }

  geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);
  const scales = new Float32Array(parameters.count * 1);
  const randomness = new Float32Array(parameters.count * 3);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    //position

    const radius = Math.random() * parameters.radius;
    const spinAngle = radius * parameters.spin;
    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius;
    positions[i3 + 1] = 0.0;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius;

    // Randomness

    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);

    randomness[i3] = randomX;
    randomness[i3 + 1] = randomY;
    randomness[i3 + 2] = randomZ;

    //color
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;

    scales[i] = Math.random();
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  geometry.setAttribute(
    "aRandomness",
    new THREE.BufferAttribute(randomness, 3)
  );

  /*
   * Material
   */
  // material = new THREE.PointsMaterial({
  //   size: parameters.size,
  //   sizeAttenuation: true,
  //   depthWrite: false,
  //   blending: THREE.AdditiveBlending,
  //   vertexColors: true,
  // });

  material = new THREE.ShaderMaterial({
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uSize: { value: 10 * renderer.getPixelRatio() },
      uTime: { value: 0 },
    },
  });

  // Points
  points = new THREE.Points(geometry, material);
  scene.add(points);

  // console.log(positions);
};

gui
  .add(parameters, "count")
  .min(100)
  .max(100000)
  .step(100)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "size")
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "radius")
  .min(0.01)
  .max(20)
  .step(0.01)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, "branches")
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(() => {
    generateGalaxy();
  });

gui
  .add(parameters, "spin")
  .min(-5)
  .max(5)
  .step(0.001)
  .onFinishChange(() => {
    generateGalaxy();
  });

gui
  .add(parameters, "randomness")
  .min(0)
  .max(2)
  .step(0.001)
  .onFinishChange(() => {
    generateGalaxy();
  });

gui
  .add(parameters, "randomnessPower")
  .min(1)
  .max(10)
  .step(0.001)
  .onFinishChange(() => {
    generateGalaxy();
  });

gui.addColor(parameters, "insideColor").onFinishChange(() => {
  generateGalaxy();
});

gui.addColor(parameters, "outsideColor").onFinishChange(() => {
  generateGalaxy();
});

gui.add(parameters, "spinSpeed").min(-5).max(5).step(0.001);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  20
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 14;
controls.minDistance = 2;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  // Stats
  stats.begin();
  const elapsedTime = clock.getElapsedTime();

  // rotate the galaxy
  // points.rotation.y = elapsedTime * parameters.spinSpeed;

  // Update Material
  material.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);

  // Stats
  stats.end();
};

generateGalaxy();

tick();
