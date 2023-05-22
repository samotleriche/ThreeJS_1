import EventEmitter from "./EventEmitter";
import Stats from "stats.js";

// Stats
const stats = new Stats();
stats.showPanel(0);
stats.domElement.style.bottom = "0px";
stats.domElement.style.top = "auto";
document.body.appendChild(stats.dom);

export default class Time extends EventEmitter {
  constructor() {
    super();

    // console.log("Time Instantiated");
    this.start = Date.now();
    this.current = this.start;
    this.elapsed = 0;
    // bug can occur if delta is 0
    this.delta = 16;

    window.requestAnimationFrame(() => {
      this.tick();
    });
  }

  tick() {
    stats.begin();
    const currentTime = Date.now();
    this.delta = currentTime - this.current;
    this.current = currentTime;
    this.elapsed = this.current - this.start;

    this.trigger("tick");

    window.requestAnimationFrame(() => {
      this.tick();
    });
    stats.end();
  }
}
