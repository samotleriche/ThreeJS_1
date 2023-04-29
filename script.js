import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { FontLoader } from "three/examples/jsm//loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

// center the text
// textGeometry.computeBoundingBox();

// textGeometry.translate(
//   -textGeometry.boundingBox.max.x * 0.5,

// use gui
const gui = new GUI();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

const doorColorTexture = textureLoader.load("/textures/door/color.jpg");
const doorAlphaTexture = textureLoader.load("/textures/door/alpha.jpg");
const doorAmbientOcclusionTexture = textureLoader.load(
  "/textures/door/ambientOcclusion.jpg"
);
const doorHeightTexture = textureLoader.load("/textures/door/height.jpg");
const doorMetalnessTexture = textureLoader.load("/textures/door/metalness.jpg");
const doorNormalTexture = textureLoader.load("/textures/door/normal.jpg");
const doorRoughnessTexture = textureLoader.load("/textures/door/roughness.jpg");

const matcapTexture = textureLoader.load("/textures/matcaps/3.png");
const gradientTexture = textureLoader.load("/textures/gradients/5.jpg");

console.log(matcapTexture);

gradientTexture.minFilter = THREE.NearestFilter;
gradientTexture.magFilter = THREE.NearestFilter;
gradientTexture.generateMipmaps = false;

const environmentMapTexture = cubeTextureLoader.load([
  "/textures/environmentMaps/1/px.jpg",
  "/textures/environmentMaps/1/nx.jpg",
  "/textures/environmentMaps/1/py.jpg",
  "/textures/environmentMaps/1/ny.jpg",
  "/textures/environmentMaps/1/pz.jpg",
  "/textures/environmentMaps/1/nz.jpg",
]);

let textGeometry;

// load the font
const fontLoader = new FontLoader();
fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
  console.log("font loaded");
  // text geometry
  textGeometry = new TextGeometry("Hello Three.js", {
    font: font,
    size: 0.5,
    height: 0.2,
    curveSegments: 6,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 4,
  });
  const textMaterial = new THREE.MeshMatcapMaterial({
    matcap: matcapTexture,
  });
  const text = new THREE.Mesh(textGeometry, textMaterial);

  // center the text
  textGeometry.center();

  text.position.set(0, 0, 1);
  scene.add(text);

  console.time("donuts");

  const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45);
  const donutMaterial = new THREE.MeshMatcapMaterial({
    matcap: matcapTexture,
  });

  for (let i = 0; i < 200; i++) {
    const donut = new THREE.Mesh(donutGeometry, donutMaterial);
    donut.position.set(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10
    );
    donut.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    const scale = Math.random();
    donut.scale.set(scale, scale, scale);
    scene.add(donut);
  }
  console.timeEnd("donuts");
});

const font = "Hello World!";

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */
let material;

// material = new THREE.MeshBasicMaterial({ color: 0xffffff });
// material.map = doorColorTexture;
// material.color = new THREE.Color(0x00ff00);
// // material.wireframe = true;
// material.transparent = true;
// material.opacity = 0.7;
// material.side = THREE.DoubleSide;

// material = new THREE.MeshNormalMaterial();
// material.flatShading = true;

// material = new THREE.MeshMatcapMaterial();
// material.matcap = matcapTexture;

// material = new THREE.MeshDepthMaterial();

// material = new THREE.MeshLambertMaterial();

// less performant that Mesh Langert Material
// material = new THREE.MeshPhongMaterial();

// material = new THREE.MeshPhongMaterial();
// material.shininess = 100;
// material.specular = new THREE.Color(0x1188ff);

// material = new THREE.MeshToonMaterial();
// material.gradientMap = gradientTexture;

material = new THREE.MeshStandardMaterial();
material.envMap = environmentMapTexture;
material.metalness = 0.7;
material.roughness = 0.5;
// material.map = doorColorTexture;
// material.aoMap = doorAmbientOcclusionTexture;
// material.aoMapIntensity = 1;
// material.displacementMap = doorHeightTexture;
// material.displacementScale = 0.05;
// material.metalnessMap = doorMetalnessTexture;
// material.normalMap = doorNormalTexture;
// material.roughnessMap = doorRoughnessTexture;
// material.alphaMap = doorAlphaTexture;
// material.transparent = true;

const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 64), material);
sphere.geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2)
);
sphere.position.x = -1.5;

const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 200, 200), material);

plane.geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2)
);

const torus = new THREE.Mesh(
  new THREE.TorusGeometry(0.3, 0.2, 64, 128),
  material
);

torus.geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2)
);

torus.position.x = 1.5;

const cube = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), material);
cube.geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(cube.geometry.attributes.uv.array, 2)
);
cube.position.y = 1.5;
cube.position.x = 1.5;

const cone = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.5, 16), material);

cone.position.y = 1.5;

const cylindar = new THREE.Mesh(
  new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16),
  material
);

cylindar.position.y = -1.5;

// create group
const group = new THREE.Group();
group.add(sphere, torus, cone, cylindar, cube);

scene.add(plane, group);

gui.add(material, "metalness").min(0).max(1).step(0.001).name("mat metalness");
gui.add(material, "roughness").min(0).max(1).step(0.001).name("mat roughness");
gui.add(material, "aoMapIntensity").min(0).max(10).step(0.001);
gui.add(material, "displacementScale").min(0).max(1).step(0.001);

// axis helper
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);

/**
 *
 * Lights
 *
 **/
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);

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
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 4;
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
  const elapsedTime = clock.getElapsedTime();

  // Update objects
  // rotate the group

  plane.rotation.x = 0.15 * elapsedTime;
  cone.rotation.x = 0.15 * elapsedTime;
  cylindar.rotation.x = 0.15 * elapsedTime;
  torus.rotation.x = 0.15 * elapsedTime;
  sphere.rotation.x = 0.15 * elapsedTime;

  plane.rotation.y = 0.15 * elapsedTime;
  cone.rotation.y = 0.15 * elapsedTime;
  cylindar.rotation.y = 0.15 * elapsedTime;
  torus.rotation.y = 0.15 * elapsedTime;
  sphere.rotation.y = 0.15 * elapsedTime;

  group.rotation.z = 0.15 * elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
