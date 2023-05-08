import * as THREE from "three";
import Experience from "../Experience";

export default class Man {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;
    this.debug = this.experience.debug;

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Man");
    }

    //setup
    this.resource = this.resources.items.manModel;

    this.setModel();
    this.setAnimation();
  }

  setModel() {
    this.model = this.resource.scene;
    // this.model.scale.set(1, 1, 1);
    this.scene.add(this.model);

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
      }
    });
  }

  setAnimation() {
    this.animation = {};
    this.animation.mixer = new THREE.AnimationMixer(this.model);
    // this.animation.action = this.animation.mixer.clipAction(
    //   this.resource.animations[0]
    // );
    this.animation.actions = {};
    this.animation.actions.walk = this.animation.mixer.clipAction(
      this.resource.animations[0]
    );
    // stop walk animation

    this.animation.actions.current = this.animation.actions.walk;
    this.animation.actions.current.play();

    this.animation.play = (name) => {
      const newAction = this.animation.actions[name];
      const oldAction = this.animation.actions.current;

      newAction.reset();
      newAction.play();
      newAction.crossFadeFrom(oldAction, 1);

      this.animation.actions.current = newAction;
    };

    this.animation.stop = () => {
      const newAction = this.animation.actions.current;
      const oldAction = this.animation.actions["walk"];

      newAction.reset();
      newAction.stop();
      newAction.crossFadeFrom(oldAction, 1);

      this.animation.actions.current = newAction;
    };

    if (this.debug.active) {
      const debugObject = {
        playWalk: () => {
          this.animation.play("walk");
        },
        stopWalk: () => {
          this.animation.stop();
        },
      };
      this.debugFolder.add(debugObject, "playWalk");
      this.debugFolder.add(debugObject, "stopWalk");
    }
  }

  update() {
    this.animation.mixer.update(this.time.delta * 0.001);
  }
}
