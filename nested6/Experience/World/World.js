import * as THREE from "three";
import Experience from "../Experience";
import Environment from "./Environment";
import Floor from "./Floor";
import Fox from "./Fox";
import Man from "./Man";

export default class World {
  constructor() {
    // instantiate the singleton
    this.experience = new Experience();

    // get the needed info from experience singleton
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // add Fox

    // wait for loaded resources
    this.resources.on("loaded", () => {
      // console.log("resources loaded");

      // Setup
      this.floor = new Floor();
      this.fox = new Fox();
      this.man = new Man();
      this.environment = new Environment();
    });
  }

  update() {
    if (this.fox) {
      this.fox.update();
    }
    if (this.man) {
      this.man.update();
    }
  }
}
