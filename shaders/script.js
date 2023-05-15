import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import vertexShader from "./shaders/vertex.glsl";
import vertexShader2 from "./shaders/vertex2.glsl";
import vertexShader3 from "./shaders/vertex3.glsl";
import vertexShader4 from "./shaders/vertex4.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import fragmentShader2 from "./shaders/fragment2.glsl";
import fragmentShader3 from "./shaders/frag3.glsl";
import fragmentShader4 from "./shaders/fragment4.glsl";
import waterVertexShader from "./shaders/waterVertex.glsl";
import waterFragmentShader from "./shaders/waterFragment.glsl";

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
const flagTexture = textureLoader.load("../textures/usFlag.jpeg");
const flag2Texture = textureLoader.load("../textures/flag-french.jpg");

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

// WATER GEO AND MATERIAL AND MESH
const waterGeometry = new THREE.PlaneGeometry(2, 2, 128, 128);
const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  side: THREE.DoubleSide,
  uniforms: {
    uBigWavesElevation: { value: 0.2 },
    uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
  },
});

gui
  .add(waterMaterial.uniforms.uBigWavesElevation, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uBigWavesElevation");

gui
  .add(waterMaterial.uniforms.uBigWavesFrequency.value, "x")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uBigWavesFrequencyX");

const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
waterMesh.rotation.x = -Math.PI * 0.5;
waterMesh.position.z = 1.5;
waterMesh.position.y = -1.5;
scene.add(waterMesh);

// Material
const material = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  side: THREE.DoubleSide,
  wireframe: false,
  transparent: true,
});

// Mesh
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const material2 = new THREE.ShaderMaterial({
  vertexShader: vertexShader2,
  fragmentShader: fragmentShader2,
  side: THREE.DoubleSide,
  wireframe: false,
  transparent: true,
  uniforms: {
    uFrequency: { value: new THREE.Vector2(10, 5) },
    uTime: { value: 0 },
    // uColor: { value: new THREE.Color("orange") },
    uTexture: { value: flag2Texture },
  },
});

const material3 = new THREE.ShaderMaterial({
  vertexShader: vertexShader3,
  fragmentShader: fragmentShader3,
  side: THREE.DoubleSide,
  wireframe: false,
  transparent: true,
  uniforms: {
    uFrequency: { value: new THREE.Vector2(10, 5) },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("orange") },
    uTexture: { value: flagTexture },
  },
});

const material4 = new THREE.ShaderMaterial({
  vertexShader: vertexShader4,
  fragmentShader: fragmentShader4,
  side: THREE.DoubleSide,
  uniforms: {
    uFrequency: { value: new THREE.Vector4(10, 5, 0, 0) },
    uTime: { value: 0 },
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

gui
  .add(material2.uniforms.uFrequency.value, "y")
  .min(0)
  .max(40)
  .step(0.01)
  .name("F frequencyY");

gui
  .add(material2.uniforms.uFrequency.value, "x")
  .min(0)
  .max(40)
  .step(0.01)
  .name("F frequencyX");

gui
  .add(material4.uniforms.uFrequency.value, "y")
  .min(0)
  .max(40)
  .step(0.1)
  .name("S frequencyY");

gui
  .add(material4.uniforms.uFrequency.value, "x")
  .min(0)
  .max(70)
  .step(0.1)
  .name("S frequencyX");

gui
  .add(material4.uniforms.uFrequency.value, "z")
  .min(0.0)
  .max(2.0)
  .step(0.01)
  .name("S frequencyZ");

gui
  .add(material4.uniforms.uFrequency.value, "w")
  .min(-2.0)
  .max(2.0)
  .step(0.01)
  .name("S frequencyZ");

// Mesh
const mesh2 = new THREE.Mesh(geometry, material2);
const mesh3 = new THREE.Mesh(geometry, material3);
const mesh4 = new THREE.Mesh(geometry, material4);

// mesh2.position.z = -1;
// rotate mesh
// mesh2.rotation.x = Math.PI / 2;
mesh4.position.set(1, 0, 0);
mesh.position.set(0, 0, -0.1);
mesh2.position.set(0, -1, 0);
mesh2.scale.set(1.5, 1, 1);
mesh3.scale.set(1.5, 1, 1);
mesh3.position.set(0, 1, 0);

scene.add(mesh2, mesh3, mesh4);

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
camera.position.set(0, -0.25, 2.5);
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
  material4.uniforms.uTime.value = elapsedTime * 2;
  material2.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
