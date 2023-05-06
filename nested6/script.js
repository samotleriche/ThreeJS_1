import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import Experience from "./Experience/Experience";

const experience = new Experience(document.querySelector("canvas.webgl"));

/**
 * Loaders
 */
// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("../draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
const debugObject = {};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// axis helper
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// debug axis helper
axesHelper.visible = false;
gui.add(axesHelper, "visible").name("Axes Helper");

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      // child.material.envMap = environmentMap
      child.material.envMapIntensity = debugObject.envMapIntensity;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
  "../textures/environmentMaps/0/px.jpg",
  "../textures/environmentMaps/0/nx.jpg",
  "../textures/environmentMaps/0/py.jpg",
  "../textures/environmentMaps/0/ny.jpg",
  "../textures/environmentMaps/0/pz.jpg",
  "../textures/environmentMaps/0/nz.jpg",
]);

environmentMap.encoding = THREE.sRGBEncoding;

// scene.background = environmentMap
scene.environment = environmentMap;

debugObject.envMapIntensity = 0.4;
gui
  .add(debugObject, "envMapIntensity")
  .min(0)
  .max(4)
  .step(0.001)
  .onChange(updateAllMaterials);

/**
 * Models
 */
let manMixer = null;
let manModel = null;

gltfLoader.load("../models//Man/man.gltf", (gltf) => {
  // Model
  gltf.scene.scale.set(1, 1, 1);
  manModel = gltf.scene;
  scene.add(manModel);

  // Animation
  manMixer = new THREE.AnimationMixer(manModel);
  const manAction = manMixer.clipAction(gltf.animations[0]);
  manAction.play();

  // Update materials
  updateAllMaterials();
});

/**
 * Floor
 */
const floorColorTexture = textureLoader.load("../textures/dirt/color.jpg");
floorColorTexture.encoding = THREE.sRGBEncoding;
floorColorTexture.repeat.set(1.5, 1.5);
floorColorTexture.wrapS = THREE.RepeatWrapping;
floorColorTexture.wrapT = THREE.RepeatWrapping;

const floorNormalTexture = textureLoader.load("../textures/dirt/normal.jpg");
floorNormalTexture.repeat.set(1.5, 1.5);
floorNormalTexture.wrapS = THREE.RepeatWrapping;
floorNormalTexture.wrapT = THREE.RepeatWrapping;

const floorGeometry = new THREE.CircleGeometry(5, 64);
const floorMaterial = new THREE.MeshStandardMaterial({
  map: floorColorTexture,
  normalMap: floorNormalTexture,
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 4);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 11;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(5, 3, -1.25);
scene.add(directionalLight);

gui
  .add(directionalLight, "intensity")
  .min(0)
  .max(10)
  .step(0.001)
  .name("lightIntensity");
gui
  .add(directionalLight.position, "x")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("lightX");
gui
  .add(directionalLight.position, "y")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("lightY");
gui
  .add(directionalLight.position, "z")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("lightZ");

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
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(6, 4, 8);
scene.add(camera);

const directionalLightCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
);

directionalLightCameraHelper.visible = false;

scene.add(directionalLightCameraHelper);

gui.add(directionalLightCameraHelper, "visible").name("Light Helper");

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.CineonToneMapping;
renderer.toneMappingExposure = 1.75;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor("#211d20");
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */

let radius = 4;

const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // animate the Man model in a cirlce
  if (manModel) {
    manModel.position.x = Math.cos(elapsedTime / 4) * (radius * 1);
    manModel.position.z = Math.sin(elapsedTime / 4) * (radius * 1);
    manModel.rotation.y = -(Math.PI * 2 * elapsedTime) / (6 * radius * 1.05);
  }

  // Update controls
  controls.update();

  // Fox animation
  if (manMixer) {
    manMixer.update(deltaTime);
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
