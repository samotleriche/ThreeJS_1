import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
// import gltf loader
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
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

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Directional Light
const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
directionalLight.position.set(2, 3, 3);
scene.add(directionalLight);

// Ambient Light
const ambientLight = new THREE.AmbientLight("#ffffff", 0.2);
scene.add(ambientLight);

// Load Models
const gltfLoader = new GLTFLoader();

let mixer = null;

let foxModel = null;

gltfLoader.load("../models/Fox/glTF/Fox.gltf", (gltf) => {
  foxModel = gltf.scene;
  mixer = new THREE.AnimationMixer(foxModel);
  mixer.clipAction(gltf.animations[0]).play();

  foxModel.scale.set(0.015, 0.015, 0.015);
  foxModel.position.set(0, 0, -2);
  foxModel.rotation.y = Math.PI * 0.5;
  scene.add(foxModel);

  // animate the fox

  console.log(gltf);

  gui
    .add(gltf.scene.rotation, "y")
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.001)
    .name("Fox rotation");
});

/**
 * Objects
 */
const object1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshStandardMaterial({ color: "#ff0000" })
);
object1.position.x = -2;

const object2 = new THREE.Mesh(
  new THREE.TorusGeometry(0.5, 0.2, 16, 32),
  new THREE.MeshStandardMaterial({ color: "#ff0000" })
);
object2.rotation.y = Math.PI / 1.5;

const object3 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshStandardMaterial({ color: "#ff0000" })
);
object3.position.x = 2;

// cerate thin cylinder object
const cylinder = new THREE.Mesh(
  new THREE.CylinderGeometry(0.04, 0.04, 7, 32),
  new THREE.MeshStandardMaterial({ color: "#ff00aa" })
);

cylinder.rotation.z = Math.PI / 2;

scene.add(object1, object2, object3, cylinder);

// Raycaster
const raycaster = new THREE.Raycaster();

// Camera Raycaster
const cameraRaycaster = new THREE.Raycaster();

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

// Mouse
const mouse = new THREE.Vector2();

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;

  // console.log(mouse.x, mouse.y);
});

window.addEventListener("click", () => {
  if (currentIntersect) {
    switch (currentIntersect.object) {
      case object1:
        console.log("click on object1");
        break;
      case object2:
        console.log("click on object2");
        break;
      case object3:
        console.log("click on object3");
      default:
        break;
    }
  }
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
camera.position.z = 3;
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

let flag1;
let flag2;
let flag3;

/**
 * Animate
 */
const clock = new THREE.Clock();
let currentTime = 0;

let currentIntersect = null;

const tick = () => {
  // Stats
  stats.begin();
  const elapsedTime = clock.getElapsedTime();
  // get time delta
  const deltaTime = elapsedTime - currentTime;
  currentTime = elapsedTime;

  const rayOrigin = new THREE.Vector3(-3, 0, 0);
  const rayDirection = new THREE.Vector3(10, 0, 0);
  rayDirection.normalize();
  raycaster.set(rayOrigin, rayDirection);

  // const intersect = raycaster.intersectObject(object2);

  const intersects = raycaster.intersectObjects([object1, object2, object3]);

  const intersectsCameraRaycaster = cameraRaycaster.intersectObjects([
    object1,
    object2,
    object3,
  ]);

  const objectsToTest = [object1, object2, object3];

  // Camera Raycaster
  cameraRaycaster.setFromCamera(mouse, camera);

  for (const object of objectsToTest) {
    object.material.color.set("#ff0000");
  }

  for (const intersect of intersects) {
    intersect.object.material.color.set("#0000ff");
  }

  for (const intersect of intersectsCameraRaycaster) {
    intersect.object.material.color.set("#00ff00");
  }

  if (intersectsCameraRaycaster.length > 0) {
    if (currentIntersect === null) {
      console.log("mouse enter");
    }
    currentIntersect = intersectsCameraRaycaster[0];
  } else {
    if (currentIntersect) {
      console.log("mouse leave");
    }
    currentIntersect = null;
  }

  // Fox intersection tracker
  if (foxModel) {
    const modelIntersects = cameraRaycaster.intersectObject(foxModel, true);

    if (modelIntersects.length > 0) {
      foxModel.scale.set(0.025, 0.025, 0.025);
    } else {
      foxModel.scale.set(0.015, 0.015, 0.015);
    }
  }

  // Animate fox
  if (mixer) {
    mixer.update(deltaTime);
  }

  // Animate objects
  object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5;
  object2.position.y = Math.sin(elapsedTime * 0.5) * 1.5;
  object3.position.y = Math.sin(elapsedTime * 0.8) * 1.5;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);

  // Stats
  stats.end();
};

tick();
