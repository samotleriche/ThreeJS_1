import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass.js";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as dat from "lil-gui";
import Stats from "stats.js";
import gsap from "gsap";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Stats
const stats = new Stats();
stats.showPanel(0);
stats.domElement.style.bottom = "0px";
stats.domElement.style.top = "auto";
document.body.appendChild(stats.dom);

let sceneReady = false;

let loadingBar = document.body.querySelector(".loading-bar");
let loadingText = document.body.querySelector(".loading-text");
let loadingText1 = document.body.querySelector(".loading-text1");

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const loadingManager = new THREE.LoadingManager(
  // Loaded
  () => {
    gsap.delayedCall(0.5, () => {
      gsap.to(overlayMaterial.uniforms.uAlpha, {
        duration: 3,
        value: 0,
        delay: 1,
      });
    });

    // wait 1 sec
    window.setTimeout(() => {
      loadingBar.classList.add("ended");
      loadingText.classList.add("ended");
      loadingText1.classList.add("ended");
      loadingBar.style.transform = "";
    }, 1500);

    window.setTimeout(() => {
      sceneReady = true;
    }, 3000);
  },

  // Progress
  (itemUrl, itemsLoaded, itemsTotal) => {
    loadingBar.style.transform = `scaleX(${itemsLoaded / itemsTotal})`;
    loadingText.innerHTML = `${Math.floor((itemsLoaded / itemsTotal) * 100)}%`;

    // console.log(itemsLoaded / itemsTotal);
  }
);

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader(loadingManager);
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);
const textureLoader = new THREE.TextureLoader(loadingManager);

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.material.envMapIntensity = 2.5;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

// overlay
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    uAlpha: { value: 1.0 },
  },
  vertexShader: `
    void main() {
      gl_Position =  vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uAlpha;

    void main() {
      gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
    }
  `,
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay);

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.jpg",
  "/textures/environmentMaps/0/nx.jpg",
  "/textures/environmentMaps/0/py.jpg",
  "/textures/environmentMaps/0/ny.jpg",
  "/textures/environmentMaps/0/pz.jpg",
  "/textures/environmentMaps/0/nz.jpg",
]);
environmentMap.encoding = THREE.sRGBEncoding;

scene.background = environmentMap;
scene.environment = environmentMap;

/**
 * Models
 */
gltfLoader.load("/models/DamagedHelmet/glTF/DamagedHelmet.gltf", (gltf) => {
  gltf.scene.scale.set(2, 2, 2);
  gltf.scene.rotation.y = Math.PI * 0.5;
  scene.add(gltf.scene);

  updateAllMaterials();
});

// Points of Interest
const raycaster = new THREE.Raycaster();
const points = [
  {
    position: new THREE.Vector3(1.45, 0.27, -0.2),
    element: document.querySelector(".point-0"),
  },
  {
    position: new THREE.Vector3(-0.5, 0.6, -1.9),
    element: document.querySelector(".point-1"),
  },
  {
    position: new THREE.Vector3(-0.5, 0.6, 2.1),
    element: document.querySelector(".point-2"),
  },
];

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 3, -2.25);
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

  // update effect composer
  effectComposer.setSize(sizes.width, sizes.height);
  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
camera.position.set(4, 1, -4);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.maxDistance = 15;
controls.minDistance = 2;
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Post Processing

const renderTarget = new THREE.WebGLRenderTarget(sizes.width, sizes.height, {
  samples: renderer.getPixelRatio() === 1 ? 2 : 0,
});

const effectComposer = new EffectComposer(renderer, renderTarget);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
effectComposer.setSize(sizes.width, sizes.height);

const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);

const dotScreenPass = new DotScreenPass();
dotScreenPass.enabled = false;
effectComposer.addPass(dotScreenPass);

const glitchPass = new GlitchPass();
glitchPass.goWild = false;
glitchPass.enabled = false;
effectComposer.addPass(glitchPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.enabled = false;
effectComposer.addPass(rgbShiftPass);

const unrealBloomPass = new UnrealBloomPass();
unrealBloomPass.strength = 0.3;
unrealBloomPass.radius = 1;
unrealBloomPass.threshold = 0.6;
unrealBloomPass.enabled = false;
effectComposer.addPass(unrealBloomPass);

// should be at end of passes but before anti alias passes
const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
effectComposer.addPass(gammaCorrectionPass);

// Anti Aliasing
// console.log(renderer.capabilities);
if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
  const smaaPass = new SMAAPass();
  effectComposer.addPass(smaaPass);
}

// Tint Pass
const TintShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTint: { value: null },
  },
  vertexShader: `
  varying vec2 vUv;

  uniform vec3 uTint;

  varying vec3 vTint;
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vUv = uv;
      vTint = uTint;
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vTint;
    uniform sampler2D tDiffuse;
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      
      color.rgb += vTint;
      gl_FragColor = vec4(color);
    }
  `,
};

const tintPass = new ShaderPass(TintShader);
tintPass.uniforms.uTint.value = new THREE.Vector3(0.2, 0.0, 0.0);
tintPass.enabled = false;
effectComposer.addPass(tintPass);

// Displacement Pass
const DisplacementShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: null },
  },
  vertexShader: `
  varying vec2 vUv;
  uniform float uTime;

  varying float vTime;

    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vUv = uv;
      vTime = uTime;
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying float vTime;
    uniform sampler2D tDiffuse;
    void main() {
      vec2 newUv = vec2(vUv.x, vUv.y + sin(vUv.x * 10.0 + vTime) * 0.05);
      
      vec4 color = texture2D(tDiffuse, newUv);
      
      gl_FragColor = vec4(color);
    }
  `,
};

const displacementPass = new ShaderPass(DisplacementShader);
displacementPass.uniforms.uTime.value = 0;
displacementPass.enabled = false;
effectComposer.addPass(displacementPass);

// Displacement Pass
const DisplacementShader2 = {
  uniforms: {
    tDiffuse: { value: null },
    uNormalMap: { value: null },
  },
  vertexShader: `
  varying vec2 vUv;

    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vUv = uv;
    }
  `,
  fragmentShader: `
    
    uniform sampler2D uNormalMap;
    uniform sampler2D tDiffuse;

    varying vec2 vUv;

    void main() {
      vec3 normalColor = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;

      vec2 newUv = vUv + normalColor.xy * 0.1;
      vec4 color = texture2D(tDiffuse, newUv);

      vec3 lightDirection = normalize(vec3(-1.0, 1.0, 0.0));
      float lightness = clamp(dot(normalColor, lightDirection), 0.0, 1.0);
      color.rgb += lightness * 2.0; 
      
      gl_FragColor = color;
    }
  `,
};

const displacementPass2 = new ShaderPass(DisplacementShader2);
displacementPass2.uniforms.uNormalMap.value = textureLoader.load(
  "../textures/interfaceNormalMap.png"
);
displacementPass2.enabled = false;
effectComposer.addPass(displacementPass2);

gui.add(dotScreenPass, "enabled").name("Dot Screen Pass");
gui.add(glitchPass, "enabled").name("Glitch Pass");
gui.add(glitchPass, "goWild").name("Go Wild (Glitch Pass)");
gui.add(rgbShiftPass, "enabled").name("RGB Shift Pass");
gui.add(unrealBloomPass, "enabled").name("Unreal Bloom Pass");
gui
  .add(unrealBloomPass, "strength")
  .min(0)
  .max(2)
  .step(0.001)
  .name("Bloom Strength");
gui
  .add(unrealBloomPass, "radius")
  .min(0)
  .max(2)
  .step(0.001)
  .name("Bloom Radius");
gui
  .add(unrealBloomPass, "threshold")
  .min(0)
  .max(2)
  .step(0.001)
  .name("Bloom Threshold");

gui.add(tintPass, "enabled").name("Custom Tint Pass");
gui
  .add(tintPass.uniforms.uTint.value, "x")
  .min(-1)
  .max(1)
  .step(0.001)
  .name("Red");
gui
  .add(tintPass.uniforms.uTint.value, "y")
  .min(-1)
  .max(1)
  .step(0.001)
  .name("Green");
gui
  .add(tintPass.uniforms.uTint.value, "z")
  .min(-1)
  .max(1)
  .step(0.001)
  .name("Blue");

gui.add(displacementPass, "enabled").name("Custom Displacement Pass");

gui.add(displacementPass2, "enabled").name("Custom Displacement Pass 2");
/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  // Stats
  stats.begin();

  const elapsedTime = clock.getElapsedTime();

  // Update passes
  displacementPass.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // loop points to update
  if (sceneReady) {
    for (const point of points) {
      const screenPosition = point.position.clone();
      screenPosition.project(camera);

      // raycaster
      raycaster.setFromCamera(screenPosition, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length === 0) {
        point.element.classList.add("visible");
      } else {
        const intersectionDistance = intersects[0].distance;
        const pointDistance = point.position.distanceTo(camera.position);

        if (intersectionDistance < pointDistance) {
          point.element.classList.remove("visible");
        } else {
          point.element.classList.add("visible");
        }
      }

      const translateX = screenPosition.x * sizes.width * 0.5;
      const translateY = -screenPosition.y * sizes.height * 0.5;
      point.element.style.transform = `translate(${translateX}px, ${translateY}px)`;
    }
  }

  // Render
  // renderer.render(scene, camera);

  // Post Processing
  effectComposer.render();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);

  // Stats
  stats.end();
};

tick();
