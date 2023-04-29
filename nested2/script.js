import * as THREE from "three";
import * as dat from "lil-gui";
import gsap from "gsap";

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// HTML Text Sections
const sections = document.querySelectorAll("section");
console.log(sections);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Debug
 */
const gui = new dat.GUI();

const parameters = {
  materialColor: "#ffeded",
  textColor: "#ff0000",
  particleNum: 4500,
  obj1Size: 0.5,
  obj2Size: 0.5,
  obj3Size: 0.4,
  vertexColors: false,
};

gui
  .addColor(parameters, "materialColor")
  .onChange(() => {
    material.color.set(parameters.materialColor);
    particlesMaterial.color.set(parameters.materialColor);
  })
  .name("Material Color");

gui
  .add(parameters, "particleNum")
  .min(100)
  .max(10000)
  .step(100)
  .onFinishChange(() => {
    generateParticles();
  });

// debug particles vertex colors
gui.add(parameters, "vertexColors").onChange(() => {
  if (parameters.vertexColors) {
    particlesMaterial.vertexColors = true;
    particlesMaterial.needsUpdate = true;
  } else {
    particlesMaterial.vertexColors = false;
    particlesMaterial.needsUpdate = true;
  }
});

gui
  .add(parameters, "obj1Size")
  .min(0.1)
  .max(5)
  .step(0.2)
  .onFinishChange(() => {
    mesh1.scale.set(
      parameters.obj1Size,
      parameters.obj1Size,
      parameters.obj1Size
    );
  });

gui
  .add(parameters, "obj2Size")
  .min(0.1)
  .max(5)
  .step(0.2)
  .onFinishChange(() => {
    mesh2.scale.set(
      parameters.obj2Size,
      parameters.obj2Size,
      parameters.obj2Size
    );
  });

gui
  .add(parameters, "obj3Size")
  .min(0.1)
  .max(5)
  .step(0.2)
  .onFinishChange(() => {
    mesh3.scale.set(
      parameters.obj3Size,
      parameters.obj3Size,
      parameters.obj3Size
    );
  });

gui.addColor(parameters, "textColor").onChange(() => {
  sections.forEach((section) => {
    section.style.color = parameters.textColor;
  });
});

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */

const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load("/textures/gradients/5.jpg");
gradientTexture.magFilter = THREE.NearestFilter;

// Material
const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});

// Meshes

const objectsDistance = 3;

const mesh1 = new THREE.Mesh(
  new THREE.TorusGeometry(parameters.obj1Size, 0.2, 16, 100),
  material
);

const mesh2 = new THREE.Mesh(
  new THREE.ConeGeometry(parameters.obj2Size, 1, 4),
  material
);

const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(parameters.obj3Size, 0.1, 100, 16),
  material
);

mesh1.position.y = objectsDistance * -0;
mesh2.position.y = objectsDistance * -1;
mesh3.position.y = objectsDistance * -2;

// keep mesh1 positon x centered on all screen sizes

mesh1.position.x = 0 + sizes.width / 2000;
mesh2.position.x = 0 + sizes.width / -2000;
mesh3.position.x = 0 + sizes.width / 2000;

scene.add(mesh1, mesh2, mesh3);

const sectionMeshes = [mesh1, mesh2, mesh3];

// Paticles
// generate particles

let particlesGeometry = null;
let particlesMaterial = null;
let particles = null;

const generateParticles = () => {
  if (particles !== null) {
    particlesGeometry.dispose();
    particlesMaterial.dispose();
    scene.remove(particles);
  }

  particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = parameters.particleNum;

  const positions = new Float32Array(particlesCount * 3);
  const colors = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3;

    // position
    positions[i3 + 0] = (Math.random() - 0.5) * 10;
    positions[i3 + 1] =
      -objectsDistance + (Math.random() - 0.5) * objectsDistance * 3;
    positions[i3 + 2] = (Math.random() - 0.5) * 10;

    // color
    colors[i3 + 0] = Math.random();
    colors[i3 + 1] = Math.random();
    colors[i3 + 2] = Math.random();
  }

  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  // add custom particle image
  const particleTexture = textureLoader.load("/textures/particles/2.png");

  particlesMaterial = new THREE.PointsMaterial({
    size: 0.1,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    map: particleTexture,
    transparent: true,
    alphaMap: particleTexture,
    vertexColors: parameters.vertexColors,
    // vertexColors: true,
  });

  particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);
};

// LIGHTS

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

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
// group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;

cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  render: true,
});
renderer.setClearAlpha(0);
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Scroll
let scrollY = window.scrollY;

let currentSection = 0;

if (currentSection === 0) {
  gsap.to(sections[currentSection], {
    x: 0,
    duration: 1,
    delay: 0.75,
    ease: "power3.out",
  });
}

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;

  const newSection = Math.round(scrollY / sizes.height);

  if (newSection !== currentSection) {
    currentSection = newSection;

    // create gsap tween
    gsap.to(sectionMeshes[currentSection].rotation, {
      x: "+=6",
      duration: 2,
      ease: "power3.inOut",
    });

    // animate the text sections

    gsap.to(sections[currentSection], {
      x: 0,
      duration: 1,
      ease: "power3.out",
    });

    // console.log(Math.round(scrollY / sizes.height));
  }
});

// cursor
const cursor = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = -(event.clientY / sizes.height - 0.5);
  // console.log(cursor);
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // animate camera
  camera.position.y = (-scrollY / sizes.height) * objectsDistance;

  const paralaxX = cursor.x * 0.5;
  const paralaxY = cursor.y * 0.5;
  cameraGroup.position.x += (paralaxX - cameraGroup.position.x) * 1 * deltaTime;
  cameraGroup.position.y += (paralaxY - cameraGroup.position.y) * 1 * deltaTime;

  // animate meshes
  sectionMeshes.forEach((mesh, index) => {
    mesh.rotation.y += deltaTime * 2;
    mesh.rotation.z += deltaTime * 1.2;
  });

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
generateParticles();
