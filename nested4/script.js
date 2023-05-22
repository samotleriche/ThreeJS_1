import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// import draco loader
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import * as dat from "lil-gui";
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

const debugObject = {
  envMapIntensity: 3,
};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// overlay
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
  vertexShader: `
    void main() {
      gl_Position =  vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    void main() {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
  `,
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay);

// updateAllMaterials
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      // child.material.envMap = environmentMapTexture;
      child.material.envMapIntensity = debugObject.envMapIntensity;
    }
  });
};

gui
  .add(debugObject, "envMapIntensity")
  .min(0)
  .max(10)
  .step(0.001)
  .onChange(updateAllMaterials);

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("../draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// cube texture loader
const cubeTextureLoader = new THREE.CubeTextureLoader();
const environmentMapTexture = cubeTextureLoader.load([
  "../textures/environmentMaps/0/px.jpg",
  "../textures/environmentMaps/0/nx.jpg",
  "../textures/environmentMaps/0/py.jpg",
  "../textures/environmentMaps/0/ny.jpg",
  "../textures/environmentMaps/0/pz.jpg",
  "../textures/environmentMaps/0/nz.jpg",
]);
environmentMapTexture.encoding = THREE.sRGBEncoding;

scene.background = environmentMapTexture;
scene.environment = environmentMapTexture;

let mixer = null;

gltfLoader.load("../models/Fox/glTF/Fox.gltf", (gltf) => {
  mixer = new THREE.AnimationMixer(gltf.scene);
  mixer.clipAction(gltf.animations[1]).play();

  gltf.scene.scale.set(0.022, 0.022, 0.022);
  gltf.scene.position.set(3, 0, 3.5);
  gltf.scene.rotation.y = Math.PI * 0.5;

  // receive shadow
  gltf.scene.traverse((child) => {
    child.castShadow = true;
    child.receiveShadow = true;
  });

  scene.add(gltf.scene);

  console.log(gltf);

  gui
    .add(gltf.scene.rotation, "y")
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.001)
    .name("Fox rotation");
});

// gltfLoader.load("../models/Duck/glTF/Duck.gltf", (gltf) => {
//   gltf.scene.scale.set(1, 1, 1);
//   gltf.scene.position.set(4, -0.1, -3);
//   gltf.scene.rotation.y = Math.PI * 0.5;
//   scene.add(gltf.scene);

//   gui
//     .add(gltf.scene.rotation, "y")
//     .min(-Math.PI)
//     .max(Math.PI)
//     .step(0.001)
//     .name("Duck rotation");
// });

gltfLoader.load("../models/FlightHelmet/glTF/FlightHelmet.gltf", (gltf) => {
  gltf.scene.scale.set(5, 5, 5);
  gltf.scene.position.set(0, 0, 0);
  gltf.scene.rotation.y = Math.PI * 0.5;
  // receive shadow
  gltf.scene.traverse((child) => {
    child.castShadow = true;
    child.receiveShadow = true;
  });
  scene.add(gltf.scene);

  gui
    .add(gltf.scene.rotation, "y")
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.001)
    .name("Helmet rotation");

  updateAllMaterials();
});

// gltfLoader.load("../models/model.gltf", (gltf) => {
//   gltf.scene.scale.set(1, 1, 1);
//   gltf.scene.position.set(-4, 0.65, 4);
//   scene.add(gltf.scene);

//   gui
//     .add(gltf.scene.rotation, "y")
//     .min(-Math.PI)
//     .max(Math.PI)
//     .step(0.001)
//     .name("Jewel rotation");
// });

gltfLoader.load("../models/tmodel.gltf", (gltf) => {
  gltf.scene.scale.set(0.75, 0.75, 0.75);
  gltf.scene.position.set(2, 0, -4);
  gltf.scene.rotation.y = Math.PI * 0.5;
  scene.add(gltf.scene);

  gltf.scene.traverse((child) => {
    child.castShadow = true;
    child.receiveShadow = true;
  });

  gui
    .add(gltf.scene.rotation, "y")
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.001)
    .name("Jewel rotation");
});

// gltfLoader.load("../models/cmodel.gltf", (gltf) => {
//   gltf.scene.scale.set(0.75, 0.75, 0.75);
//   gltf.scene.position.set(-2, 0, -4);
//   gltf.scene.rotation.y = Math.PI * 0.5;
//   scene.add(gltf.scene);

//   gui
//     .add(gltf.scene.rotation, "y")
//     .min(-Math.PI)
//     .max(Math.PI)
//     .step(0.001)
//     .name("Jewel rotation");
// });

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: "#222",
    metalness: 0,
    roughness: 0.5,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.75);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 12;
directionalLight.shadow.camera.left = -5;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 5;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(0.08, 4, -3);
scene.add(directionalLight);

const directionalLightCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
);

directionalLightCameraHelper.visible = false;

scene.add(directionalLightCameraHelper);

gui.add(directionalLightCameraHelper, "visible").name("Light Helper");

gui
  .add(directionalLight, "intensity")
  .min(0)
  .max(3)
  .step(0.002)
  .name("Light Intensity");
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
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(5, 5, 5);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;
controls.maxDistance = 12;
controls.minDistance = 3;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

gui.add(renderer, "toneMapping", {
  No: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinet: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACES: THREE.ACESFilmicToneMapping,
});

gui.add(renderer, "toneMappingExposure").min(0).max(10).step(0.001);

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  stats.begin();
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // update mixer
  if (mixer != null) mixer.update(deltaTime);

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
  stats.end();
};

tick();
