const color = new Proxy({
  r: 255,
  g: 255,
  b: 255,
  a: 1,

  pick(clr) {
    preview.style.background = toRGBA(clr);
  },

  update(clr) {
    const rgba = toRGBA(clr, 1);
    [this.r, this.g, this.b] = [...rgba];
    this.a = rgba[3] || 1;
    console.log(color.rgba);
  },

  setSliders() {
    document.querySelectorAll(".picker-container > input[type='range']").forEach((slider, i) => {
      const arr = ['r', 'g', 'b', 'a'];
      slider.value = this[arr[i]];
    });
  }
}, {
  get(target, key) {
    if (key === "rgba") return `rgba(${target.r}, ${target.g}, ${target.b}, ${target.a})`;

    return target[key];
  },

  set(target, key, val) {
    target[key] = val;
    color.pick(color.rgba);
    colorInput.value = color.rgba;
    return 1;
  }
});

const colorInput = document.querySelector(".color-value");
const preview = document.querySelector(".preview");
color.pick("white");

function toRGBA(clr, arr=0) {
  const div = document.createElement("div");
  div.style.background = clr;
  document.body.append(div);
  const color = getComputedStyle(div).getPropertyValue("background-color");
  div.remove();

  return arr ? color.replace(/rgba?/, "").replace(/[\(\)\s]/g, "").split(",").map(c => +c) : color;
}

document.querySelectorAll(".picker-container > input[type='range']").forEach((slider, i) => {
  const arr = ["r", "g", "b", "a"];

  slider.addEventListener("input", function() {
    color[arr[i]] = this.value;
  });
});

colorInput.addEventListener("change", function() {
  color.pick(this.value);
  color.update(this.value);
  color.setSliders();
});