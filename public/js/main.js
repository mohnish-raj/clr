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
    [this.r, this.g, this.b, this.a] = [...rgba];
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

const flags = {
  deleteSw : 0
}

const colorInput = document.querySelector(".color-value");
const preview = document.querySelector(".preview");
const swContainer = document.querySelector(".sw-colors-container");

const xhr = new XMLHttpRequest();
xhr.open("GET", "/getswatches", false);
xhr.send();

let colorData;
if (xhr.status === 200) colorData = JSON.parse(xhr.responseText);

fetch("/getswatches")
  .then(res => res.json())
  .then(res => {
    res.colors.forEach(addSwatch);
    colorData = res;
  })
  .catch(console.error);

function pick(clr=color.rgba) {
  color.pick(clr);
  color.update(clr);
  color.setSliders();
}

pick("white");

function toRGBA(clr, arr=0) {
  const div = document.createElement("div");
  div.style.background = clr;
  document.body.append(div);
  const color = getComputedStyle(div).getPropertyValue("background-color");
  const comps = color.replace(/rgba?/, "").replace(/[\(\)\s]/g, "").split(",").map(c => +c)
  if (!comps[3]) comps.push(1);
  div.remove();

  return arr ? comps : `rgba(${comps[0]}, ${comps[1]}, ${comps[2]}, ${comps[3]})`;
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

preview.addEventListener("dblclick", function() {
  const clr = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`;
  color.pick(clr);
  color.update(clr);
  color.setSliders();
});

function addSwatch(clr) {
  clr = toRGBA(clr);
  const sw = document.createElement("div");
  sw.className = "sw-color";
  sw.style.color = clr;
  sw.dataset.color = clr;
  swContainer.append(sw);

  sw.addEventListener("click", function() {
    if (flags.deleteSw) removeSwatch(this.dataset.color);

    color.update(clr);
    color.pick(clr);
    color.setSliders();
  });
}

function removeSwatch(clr) {
  const idx = colorData.colors.findIndex(c => c === clr);
  colorData.colors.splice(idx, 1);
  const elem = [...swContainer.querySelectorAll(".sw-color")].find(elem => elem.dataset.color === clr);
  elem.remove();
  
  fetch("/deleteswatch/" + idx, { method : "DELETE" })
}

document.querySelector(".add-fav").addEventListener("click", function() {
  if (colorData.colors.includes(color.rgba)) return;
  fetch("/addfav", {
    method : "POST",
    headers: {
      'Content-Type': 'application/json'
   },
    body : JSON.stringify({
      color: color.rgba
    })
  })
    .then(res => res.text())
    .then(() => {
      addSwatch(color.rgba);
    })
    .catch(console.error);
});

document.querySelector(".delete-fav").addEventListener("click", function() {
  this.classList.toggle("active");
  flags.deleteSw = !flags.deleteSw;
});