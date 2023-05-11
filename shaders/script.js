import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import vertexShader from "./shaders/vertex.glsl";
import vertexShader2 from "./shaders/vertex2.glsl";
import vertexShader3 from "./shaders/vertex3.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import fragmentShader2 from "./shaders/fragment2.glsl";
import fragmentShader3 from "./shaders/frag3.glsl";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.PlaneGeometry(1, 1, 64, 64);
console.log(geometry);
const count = geometry.attributes.position.count;
const randoms = new Float32Array(count);

for (let i = 0; i < count; i++) {
  randoms[i] = Math.random();
}

geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));

// Material
const material = new THREE.RawShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  side: THREE.DoubleSide,
  wireframe: false,
  transparent: true,
});

// Mesh
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const material2 = new THREE.RawShaderMaterial({
  vertexShader: vertexShader2,
  fragmentShader: fragmentShader2,
  side: THREE.DoubleSide,
  wireframe: false,
  transparent: true,
});

const material3 = new THREE.RawShaderMaterial({
  vertexShader: vertexShader3,
  fragmentShader: fragmentShader3,
  side: THREE.DoubleSide,
  wireframe: false,
  transparent: true,
  uniforms: {
    uFrequency: { value: new THREE.Vector2(10, 5) },
    uTime: { value: 0 },
    // uColor: { value: new THREE.Color("orange") },
  },
});

gui
  .add(material3.uniforms.uFrequency.value, "x")
  .min(0)
  .max(40)
  .step(0.01)
  .name("frequencyX");
gui
  .add(material3.uniforms.uFrequency.value, "y")
  .min(0)
  .max(40)
  .step(0.01)
  .name("frequencyY");

// Mesh
const mesh2 = new THREE.Mesh(geometry, material2);
const mesh3 = new THREE.Mesh(geometry, material3);

// mesh2.position.z = -1;
// rotate mesh
// mesh2.rotation.x = Math.PI / 2;
mesh2.position.set(1, 0, 0);
mesh3.position.set(-1, 0, 0);

scene.add(mesh2, mesh3);

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
  100
);
camera.position.set(0, 0, 2.5);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

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
  const elapsedTime = clock.getElapsedTime();

  // Update materials
  material3.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
