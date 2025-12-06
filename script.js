const canvas = document.getElementById("fractal");
const ctx = canvas.getContext("2d");

let seed = Math.random() * 360;
let startTime = performance.now();
let depth = 5;
let rotationSpeedDeg = 12;
let shrinkFactor = 0.55;
let spacingFactor = 1.12;
let wobbleStrength = 0.2;

const depthSlider = document.getElementById("depth");
const depthValue = document.getElementById("depthValue");
const rotationSpeedSlider = document.getElementById("rotationSpeed");
const rotationSpeedValue = document.getElementById("rotationSpeedValue");
const shrinkFactorSlider = document.getElementById("shrinkFactor");
const shrinkFactorValue = document.getElementById("shrinkFactorValue");
const spacingSlider = document.getElementById("spacing");
const spacingValue = document.getElementById("spacingValue");

function resize() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

function hsla(h, s, l, a = 1) {
  return `hsla(${h % 360}, ${s}%, ${l}%, ${a})`;
}

function drawHexagon(x, y, size, rotation, stroke, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const px = Math.cos(angle) * size;
    const py = Math.sin(angle) * size;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = Math.max(1.2, size * 0.02);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFractal(x, y, size, depth, time, hueBase) {
  if (size < 4 || depth <= 0) return;

  const wobble = Math.sin(time * 0.001 + depth) * wobbleStrength;
  const rotationSpeed = (rotationSpeedDeg * Math.PI) / (180 * 1000);
  const rotation = wobble + (time * rotationSpeed + depth * 0.3);
  const hue = hueBase + depth * 22 + wobble * 40;
  const stroke = hsla(hue, 80, 70, 0.9);
  const fill = hsla(hue + 40, 70, 30, 0.35);

  drawHexagon(x, y, size, rotation, stroke, fill);

  const nextSize = size * shrinkFactor;
  const radius = size * spacingFactor;

  for (let i = 0; i < 6; i++) {
    const angle = rotation + (Math.PI / 3) * i;
    const nx = x + Math.cos(angle) * radius;
    const ny = y + Math.sin(angle) * radius;
    drawFractal(nx, ny, nextSize, depth - 1, time + i * 80, hueBase + 10);
  }
}

function clearCanvas() {
  ctx.fillStyle = "rgba(12, 15, 26, 0.22)";
  const rect = canvas.getBoundingClientRect();
  ctx.fillRect(0, 0, rect.width, rect.height);
}

function render(time) {
  const rect = canvas.getBoundingClientRect();
  clearCanvas();

  const size = Math.min(rect.width, rect.height) * 0.19;
  const hueBase = seed + (time - startTime) * 0.02;

  ctx.save();
  ctx.scale(1, 1);
  drawFractal(rect.width / 2, rect.height / 2, size, depth, time, hueBase);
  ctx.restore();

  requestAnimationFrame(render);
}

function handleClick() {
  seed = Math.random() * 360;
  startTime = performance.now();
}

function handleDepthChange(value) {
  depth = Number(value);
  depthValue.textContent = depth.toString();
}

function handleRotationChange(value) {
  rotationSpeedDeg = Number(value);
  rotationSpeedValue.textContent = `${rotationSpeedDeg}°/s`;
}

function handleShrinkChange(value) {
  shrinkFactor = Number(value);
  shrinkFactorValue.textContent = shrinkFactor.toFixed(2);
}

function handleSpacingChange(value) {
  spacingFactor = Number(value);
  spacingValue.textContent = spacingFactor.toFixed(2);
}

window.addEventListener("resize", resize);
canvas.addEventListener("click", handleClick);
depthSlider.addEventListener("input", (event) => handleDepthChange(event.target.value));
rotationSpeedSlider.addEventListener("input", (event) => handleRotationChange(event.target.value));
shrinkFactorSlider.addEventListener("input", (event) => handleShrinkChange(event.target.value));
spacingSlider.addEventListener("input", (event) => handleSpacingChange(event.target.value));
handleDepthChange(depthSlider.value);
handleRotationChange(rotationSpeedSlider.value);
handleShrinkChange(shrinkFactorSlider.value);
handleSpacingChange(spacingSlider.value);
resize();
requestAnimationFrame(render);
