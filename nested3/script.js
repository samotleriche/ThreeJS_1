import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import * as CANNON from "cannon-es";

// console.log(CANNON);

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentMapTexture = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.jpg",
  "/textures/environmentMaps/0/nx.jpg",
  "/textures/environmentMaps/0/py.jpg",
  "/textures/environmentMaps/0/ny.jpg",
  "/textures/environmentMaps/0/pz.jpg",
  "/textures/environmentMaps/0/nz.jpg",
]);

/**
 * Debug
 */
const gui = new dat.GUI();

const debugObject = {
  metalness: 0.82,
  roughness: 0.04,

  createSphere: () => {
    createSphere(Math.random() * 0.5, {
      x: (Math.random() - 0.5) * 3,
      y: 3,
      z: (Math.random() - 0.5) * 3,
    });
  },
  createBox: () => {
    createBox(Math.random(), Math.random(), Math.random(), {
      x: (Math.random() - 0.5) * 3,
      y: 3,
      z: (Math.random() - 0.5) * 3,
    });
  },
  createJenga: () => {
    createJenga();
  },
  reset: () => {
    for (const object of objectsToUpdate) {
      object.body.removeEventListener("collide", playHitSound);
      world.removeBody(object.body);
      scene.remove(object.mesh);
    }

    objectsToUpdate.splice(0, objectsToUpdate.length);
    // console.log(objectsToUpdate);
  },
};

const allMaterial = new THREE.MeshStandardMaterial({
  metalness: debugObject.metalness,
  roughness: debugObject.roughness,
  envMap: environmentMapTexture,
  envMapIntensity: 0.5,
});

gui.add(debugObject, "createSphere");
gui.add(debugObject, "createBox");
gui.add(debugObject, "createJenga");

gui
  .add(debugObject, "metalness")
  .min(0)
  .max(1)
  .step(0.0001)
  .name("Metalness")
  .onChange(() => {
    allMaterial.metalness = debugObject.metalness;
  });
gui
  .add(debugObject, "roughness")
  .min(0)
  .max(1)
  .step(0.0001)
  .name("Roughness")
  .onChange(() => {
    allMaterial.roughness = debugObject.roughness;
  });

gui.add(debugObject, "reset");

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Sound
const hitSound = new Audio("/sounds/hit.mp3");

// save last time
let lastHitTime = Date.now();

const playHitSound = (collision) => {
  const impactStrength = collision.contact.getImpactVelocityAlongNormal();

  if (impactStrength > 1.5) {
    // dont play sound if too soon after previous sound
    if (Date.now() - lastHitTime > 100) {
      lastHitTime = Date.now();

      hitSound.volume = Math.random();
      hitSound.currentTime = 0;
      hitSound.play();
    } else {
      return;
    }
  }
};

// Physics world
const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
world.gravity.set(0, -9.82, 0);

// Materials
const concreteMaterial = new CANNON.Material("concrete");
const plasticMaterial = new CANNON.Material("plastic");

const concretePlasticContactMaterial = new CANNON.ContactMaterial(
  concreteMaterial,
  plasticMaterial,
  {
    friction: 0.1,
    restitution: 0.5,
  }
);

const concreteContactMaterial = new CANNON.ContactMaterial(
  concreteMaterial,
  concreteMaterial,
  {
    friction: 0.2,
    restitution: 0.2,
  }
);

const plasticContactMaterial = new CANNON.ContactMaterial(
  plasticMaterial,
  plasticMaterial,
  {
    friction: 0.1,
    restitution: 0.8,
  }
);

world.addContactMaterial(concretePlasticContactMaterial);
world.addContactMaterial(concreteContactMaterial);
world.addContactMaterial(plasticContactMaterial);

// // Sphere
// const sphereShape = new CANNON.Sphere(0.5);
// const sphereBody = new CANNON.Body({
//   mass: 2,
//   position: new CANNON.Vec3(-4, 3, 0),
//   shape: sphereShape,
//   material: plasticMaterial,
// });
// sphereBody.applyLocalForce(
//   new CANNON.Vec3(450, 0, 0),
//   new CANNON.Vec3(0, 0, 0)
// );
// world.addBody(sphereBody);

// // Sphere2

// const sphereBody2 = new CANNON.Body({
//   mass: 2,
//   position: new CANNON.Vec3(1.5, 3, 0),
//   shape: sphereShape,
//   material: concreteMaterial,
// });
// world.addBody(sphereBody2);

// Floor
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.mass = 0;
floorBody.material = concreteMaterial;
floorBody.addShape(floorShape);

floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);

world.addBody(floorBody);

/**
 * Test spheres
 */
// sphere geo

// const sphere = new THREE.Mesh(
//   new THREE.SphereGeometry(0.5, 32, 32),
//   new THREE.MeshStandardMaterial({
//     metalness: 0.3,
//     roughness: 0.4,
//     envMap: environmentMapTexture,
//     envMapIntensity: 0.5,
//   })
// );
// sphere.castShadow = true;
// sphere.position.y = 0.5;
// sphere.position.x = -1.5;
// scene.add(sphere);

// const sphere2 = new THREE.Mesh(
//   new THREE.SphereGeometry(0.5, 32, 32),
//   new THREE.MeshStandardMaterial({
//     metalness: 0.3,
//     roughness: 0.4,
//     envMap: environmentMapTexture,
//     envMapIntensity: 0.5,
//   })
// );
// sphere2.castShadow = true;
// sphere2.position.y = 0.5;
// sphere2.position.x = 1.5;
// scene.add(sphere2);

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: "#777777",
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

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
camera.position.set(-3, 3, 3);
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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);

// Utils

const objectsToUpdate = [];

const createJenga = () => {
  // const jenga = new THREE.Group();

  const size = 0.5;
  const mass = 1;
  const gap = 0.02;

  // Layers
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 3; j++) {
      const body = new CANNON.Body({ mass });

      let halfExtents;

      let dx;
      let dz;
      if (i % 2 === 0) {
        halfExtents = new CANNON.Vec3(size, size, size * 3);
        dx = 1;
        dz = 0;
      } else {
        halfExtents = new CANNON.Vec3(size * 3, size, size);
        dx = 0;
        dz = 1;
      }

      const shape = new CANNON.Box(halfExtents);
      body.addShape(shape);
      body.position.set(
        2 * (size + gap) * (j - 1) * dx,
        2 * (size + gap) * (i + 1),
        2 * (size + gap) * (j - 1) * dz
      );

      body.addEventListener("collide", playHitSound);

      world.addBody(body);

      // Jenga Mesh
      const jengaGeometry = new THREE.BoxGeometry(
        halfExtents.x * 2,
        halfExtents.y * 2,
        halfExtents.z * 2
      );

      const mesh = new THREE.Mesh(jengaGeometry, allMaterial);

      mesh.castShadow = true;
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);

      scene.add(mesh);

      objectsToUpdate.push({
        mesh,
        body,
      });
    }
  }
};

const createBox = (width, height, depth, position) => {
  // Three.js mesh
  const mesh = new THREE.Mesh(boxGeometry, allMaterial);
  mesh.scale.set(width, height, depth);
  mesh.castShadow = true;
  mesh.position.copy(position);
  scene.add(mesh);

  // Cannon.js body
  const shape = new CANNON.Box(
    new CANNON.Vec3(width / 2, height / 2, depth / 2)
  );
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(position.x, position.y, position.z),
    shape,
    material: plasticMaterial,
  });
  body.addEventListener("collide", playHitSound);

  world.addBody(body);

  objectsToUpdate.push({ mesh, body });
};

const createSphere = (radius, position) => {
  const mesh = new THREE.Mesh(sphereGeometry, allMaterial);
  mesh.scale.set(radius, radius, radius);
  mesh.castShadow = true;
  mesh.position.copy(position);
  scene.add(mesh);

  const shape = new CANNON.Sphere(radius);
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(position.x, position.y, position.z),
    shape,
    material: plasticMaterial,
  });
  body.addEventListener("collide", playHitSound);
  world.addBody(body);

  objectsToUpdate.push({ mesh, body });
};

// createSphere(0.5, { x: 0, y: 3, z: 0 });
// createSphere(0.5, { x: 0.1, y: 5, z: 0 });
// createSphere(0.5, { x: -0.1, y: 7, z: 0 });

createBox(1, 1, 1, { x: 3, y: 3, z: 0 });
createBox(1, 1, 1, { x: 3, y: 6, z: 0 });
createBox(1, 1, 1, { x: 3, y: 9, z: 0 });

// createJenga();

// console.log(objectsToUpdate);

/**
 * Animate
 */
const clock = new THREE.Clock();
let oldElapsedTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldElapsedTime;
  oldElapsedTime = elapsedTime;

  // Update physics world

  // sphereBody2.applyForce(new CANNON.Vec3(-1, 0, 0), sphereBody2.position);

  world.step(1 / 60, deltaTime, 3);

  for (const object of objectsToUpdate) {
    object.mesh.position.copy(object.body.position);
    object.mesh.quaternion.copy(object.body.quaternion);
  }

  // sphere.position.copy(sphereBody.position);
  // sphere2.position.copy(sphereBody2.position);

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
