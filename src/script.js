const canvas = document.getElementById("fractal");
const ctx = canvas.getContext("2d");

let seed = Math.random() * 360;
let startTime = performance.now();
let depth = 5;
let rotationSpeedDeg = 12;
let shrinkFactor = 0.55;
let spacingFactor = 1.12;
let wobbleStrength = 0.2;
let delayMs = 80;
let hueRange = 240;
let currentTypeKey = "classic";

const typeConfigs = {
  classic: {
    label: "クラシック",
    description: "標準的な六角形フラクタルで、回転と色のグラデーションが穏やかに広がります。",
    mode: "fractal",
    params: {
      depth: 5,
      rotationSpeedDeg: 12,
      shrinkFactor: 0.55,
      spacingFactor: 1.12,
      wobbleStrength: 0.2,
      delayMs: 80,
      hueRange: 240,
    },
  },
  spiral: {
    label: "スパイラルアーム",
    description: "六角形が渦を描きながら回転し、時間とともに帯のように波打ちます。",
    mode: "spiral",
    params: {
      depth: 6,
      rotationSpeedDeg: 18,
      shrinkFactor: 0.6,
      spacingFactor: 1.0,
      wobbleStrength: 0.35,
      delayMs: 120,
      hueRange: 320,
    },
  },
  concentric: {
    label: "重心オーバーレイ",
    description: "重なった六角形の群が少しずつ異なる速度で回転し、干渉パターンを作ります。",
    mode: "concentric",
    params: {
      depth: 8,
      rotationSpeedDeg: 10,
      shrinkFactor: 0.86,
      spacingFactor: 1.08,
      wobbleStrength: 0.15,
      delayMs: 60,
      hueRange: 200,
    },
  },
  lattice: {
    label: "オービタルメッシュ",
    description: "同心円状に配置された六角形の群が速度差で絡み合う、網目状のアニメーション。",
    mode: "orbital",
    params: {
      depth: 4,
      rotationSpeedDeg: 15,
      shrinkFactor: 0.5,
      spacingFactor: 1.25,
      wobbleStrength: 0.25,
      delayMs: 90,
      hueRange: 280,
    },
  },
};

const depthSlider = document.getElementById("depth");
const depthValue = document.getElementById("depthValue");
const rotationSpeedSlider = document.getElementById("rotationSpeed");
const rotationSpeedValue = document.getElementById("rotationSpeedValue");
const shrinkFactorSlider = document.getElementById("shrinkFactor");
const shrinkFactorValue = document.getElementById("shrinkFactorValue");
const spacingSlider = document.getElementById("spacing");
const spacingValue = document.getElementById("spacingValue");
const delaySlider = document.getElementById("delay");
const delayValue = document.getElementById("delayValue");
const hueRangeSlider = document.getElementById("hueRange");
const hueRangeValue = document.getElementById("hueRangeValue");
const typeSelect = document.getElementById("type");
const typeLabel = document.getElementById("typeLabel");
const typeHint = document.getElementById("typeHint");

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
  const hue = hueBase + depth * (hueRange / 10) + wobble * (hueRange / 6);
  const stroke = hsla(hue, 80, 70, 0.9);
  const fill = hsla(hue + hueRange / 9, 70, 30, 0.35);

  drawHexagon(x, y, size, rotation, stroke, fill);

  const nextSize = size * shrinkFactor;
  const radius = size * spacingFactor;

  for (let i = 0; i < 6; i++) {
    const angle = rotation + (Math.PI / 3) * i;
    const nx = x + Math.cos(angle) * radius;
    const ny = y + Math.sin(angle) * radius;
    drawFractal(nx, ny, nextSize, depth - 1, time + i * delayMs, hueBase + hueRange / 18);
  }
}

function drawSpiral(x, y, size, depth, time, hueBase) {
  const speed = (rotationSpeedDeg * Math.PI) / (180 * 1000);
  const steps = Math.max(16, depth * 8);

  for (let i = 0; i < steps; i++) {
    const progress = i / steps;
    const localTime = time + delayMs * progress * 0.8;
    const wobble = Math.sin(localTime * 0.001 + i * 0.6) * wobbleStrength;
    const angle = localTime * speed * 0.6 + progress * Math.PI * 3 + wobble * 0.8;
    const radius = size * (0.6 + spacingFactor * progress * 2.4);
    const localSize = Math.max(4, size * Math.pow(shrinkFactor, progress * depth));
    const hue = hueBase + progress * hueRange + wobble * (hueRange / 4);
    const stroke = hsla(hue, 82, 68, 0.9);
    const fill = hsla(hue + hueRange / 12, 70, 28, 0.3);

    drawHexagon(
      x + Math.cos(angle) * radius,
      y + Math.sin(angle) * radius,
      localSize,
      angle + wobble,
      stroke,
      fill,
    );
  }
}

function drawConcentric(x, y, size, depth, time, hueBase) {
  const speed = (rotationSpeedDeg * Math.PI) / (180 * 1000);
  const layers = Math.max(4, depth);

  for (let i = 0; i < layers; i++) {
    const factor = Math.pow(shrinkFactor, i * 0.65);
    const layerSize = Math.max(5, size * factor);
    const rotation = (time + delayMs * i * 0.6) * speed * (1 + i * 0.08) + i * 0.45;
    const hue = hueBase + i * (hueRange / 9);
    const stroke = hsla(hue, 88, 72, 0.92);
    const fill = hsla(hue + hueRange / 12, 70, 25, 0.22 + i * 0.04);

    drawHexagon(x, y, layerSize, rotation, stroke, fill);
  }

  const orbitCount = Math.max(3, Math.round(layers / 2));
  for (let j = 0; j < orbitCount; j++) {
    const radius = size * spacingFactor * (0.6 + j * 0.7);
    const nodes = 6 + j * 2;
    for (let n = 0; n < nodes; n++) {
      const baseAngle = (Math.PI * 2 * n) / nodes;
      const rotation =
        (time + delayMs * (j + n * 0.2)) * speed * (0.35 + j * 0.12) + baseAngle + wobbleStrength * Math.sin(time * 0.001 + n);
      const hue = hueBase + j * (hueRange / 6) + n * (hueRange / 80);
      const sizeScale = Math.max(0.4, 1 - j * 0.18);
      const childSize = Math.max(3, size * 0.35 * sizeScale);
      const stroke = hsla(hue, 80, 76, 0.85);
      const fill = hsla(hue + 10, 72, 38, 0.18);

      drawHexagon(
        x + Math.cos(rotation) * radius,
        y + Math.sin(rotation) * radius,
        childSize,
        rotation,
        stroke,
        fill,
      );
    }
  }
}

function drawOrbital(x, y, size, depth, time, hueBase) {
  const speed = (rotationSpeedDeg * Math.PI) / (180 * 1000);
  const rings = Math.max(3, depth + 1);

  drawHexagon(
    x,
    y,
    size * 0.8,
    (time + delayMs * 0.8) * speed * 0.8,
    hsla(hueBase, 85, 74, 0.9),
    hsla(hueBase + hueRange / 10, 70, 24, 0.26),
  );

  for (let r = 1; r <= rings; r++) {
    const radius = size * spacingFactor * (0.8 + r * 0.65);
    const count = 6 + r * 3;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const rotation =
        (time + delayMs * (r + i * 0.1)) * speed * (0.45 + r * 0.14) + angle + wobbleStrength * Math.sin(time * 0.0015 + i);
      const localSize = Math.max(3, size * Math.pow(shrinkFactor, r));
      const hue = hueBase + r * (hueRange / 8) + i * (hueRange / 90);
      const stroke = hsla(hue, 78, 72, 0.88);
      const fill = hsla(hue + hueRange / 14, 70, 28, 0.18);

      drawHexagon(
        x + Math.cos(rotation) * radius,
        y + Math.sin(rotation) * radius,
        localSize,
        rotation,
        stroke,
        fill,
      );
    }
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
  const mode = typeConfigs[currentTypeKey].mode;

  ctx.save();
  ctx.scale(1, 1);
  const x = rect.width / 2;
  const y = rect.height / 2;

  switch (mode) {
    case "spiral":
      drawSpiral(x, y, size, depth, time, hueBase);
      break;
    case "concentric":
      drawConcentric(x, y, size, depth, time, hueBase);
      break;
    case "orbital":
      drawOrbital(x, y, size, depth, time, hueBase);
      break;
    default:
      drawFractal(x, y, size, depth, time, hueBase);
  }
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

function handleDelayChange(value) {
  delayMs = Number(value);
  delayValue.textContent = `${delayMs}ms`;
}

function handleHueRangeChange(value) {
  hueRange = Number(value);
  hueRangeValue.textContent = `${hueRange}°`;
}

function applyParams(params) {
  depthSlider.value = params.depth;
  handleDepthChange(params.depth);

  rotationSpeedSlider.value = params.rotationSpeedDeg;
  handleRotationChange(params.rotationSpeedDeg);

  shrinkFactorSlider.value = params.shrinkFactor;
  handleShrinkChange(params.shrinkFactor);

  spacingSlider.value = params.spacingFactor;
  handleSpacingChange(params.spacingFactor);

  wobbleStrength = params.wobbleStrength;

  delaySlider.value = params.delayMs;
  handleDelayChange(params.delayMs);

  hueRangeSlider.value = params.hueRange;
  handleHueRangeChange(params.hueRange);
}

function handleTypeChange(value) {
  if (!typeConfigs[value]) return;
  currentTypeKey = value;
  const config = typeConfigs[value];
  typeLabel.textContent = config.label;
  typeHint.textContent = config.description;
  applyParams(config.params);
  seed = Math.random() * 360;
  startTime = performance.now();
}

function setupTypeOptions() {
  Object.entries(typeConfigs).forEach(([key, config]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = config.label;
    typeSelect.appendChild(option);
  });
}

window.addEventListener("resize", resize);
canvas.addEventListener("click", handleClick);
depthSlider.addEventListener("input", (event) => handleDepthChange(event.target.value));
rotationSpeedSlider.addEventListener("input", (event) => handleRotationChange(event.target.value));
shrinkFactorSlider.addEventListener("input", (event) => handleShrinkChange(event.target.value));
spacingSlider.addEventListener("input", (event) => handleSpacingChange(event.target.value));
delaySlider.addEventListener("input", (event) => handleDelayChange(event.target.value));
hueRangeSlider.addEventListener("input", (event) => handleHueRangeChange(event.target.value));
typeSelect.addEventListener("change", (event) => handleTypeChange(event.target.value));

setupTypeOptions();
typeSelect.value = currentTypeKey;
handleTypeChange(currentTypeKey);
resize();
requestAnimationFrame(render);
