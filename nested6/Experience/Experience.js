import Sizes from "./Utils/Sizes";

export default class Experience {
  constructor(canvas) {
    //global access
    window.experience = this;

    // Options
    this.canvas = canvas;

    // Setup
    this.sizes = new Sizes();
  }
}
