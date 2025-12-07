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
  pendulum: {
    label: "振り子レイヤー",
    description: "左右に揺れるアームが層を作り、重力に引かれるようなテンポで波打ちます。",
    mode: "pendulum",
    params: {
      depth: 5,
      rotationSpeedDeg: 9,
      shrinkFactor: 0.68,
      spacingFactor: 1.28,
      wobbleStrength: 0.45,
      delayMs: 140,
      hueRange: 260,
    },
  },
  aurora: {
    label: "オーロラシフト",
    description: "淡い帯がゆっくりと重なり、やさしく揺れる光のカーテンを描きます。",
    mode: "aurora",
    params: {
      depth: 7,
      rotationSpeedDeg: 8,
      shrinkFactor: 0.62,
      spacingFactor: 1.05,
      wobbleStrength: 0.18,
      delayMs: 70,
      hueRange: 340,
    },
  },
  comet: {
    label: "コメットトレイル",
    description: "光の尾を引くような螺旋で、鋭い回転が流星群の軌跡を形作ります。",
    mode: "comet",
    params: {
      depth: 6,
      rotationSpeedDeg: 24,
      shrinkFactor: 0.52,
      spacingFactor: 1.18,
      wobbleStrength: 0.28,
      delayMs: 95,
      hueRange: 360,
    },
  },
  prism: {
    label: "プリズムグリッド",
    description: "微妙な速度差で回転する層が、格子状に光を散らすパターンです。",
    mode: "prism",
    params: {
      depth: 9,
      rotationSpeedDeg: 9,
      shrinkFactor: 0.82,
      spacingFactor: 1.02,
      wobbleStrength: 0.12,
      delayMs: 55,
      hueRange: 260,
    },
  },
  bloom: {
    label: "ブルームリング",
    description: "花弁のようなリングが穏やかに膨らみ、柔らかな光輪を作ります。",
    mode: "bloom",
    params: {
      depth: 5,
      rotationSpeedDeg: 14,
      shrinkFactor: 0.58,
      spacingFactor: 1.34,
      wobbleStrength: 0.22,
      delayMs: 130,
      hueRange: 300,
    },
  },
  ripple: {
    label: "リップルレイヤー",
    description: "水面の波紋のように、層がずれて重なり合う揺らぎを楽しめます。",
    mode: "ripple",
    params: {
      depth: 7,
      rotationSpeedDeg: 12,
      shrinkFactor: 0.74,
      spacingFactor: 1.15,
      wobbleStrength: 0.32,
      delayMs: 110,
      hueRange: 220,
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
const wobbleStrengthSlider = document.getElementById("wobbleStrength");
const wobbleStrengthValue = document.getElementById("wobbleStrengthValue");
const delaySlider = document.getElementById("delay");
const delayValue = document.getElementById("delayValue");
const hueRangeSlider = document.getElementById("hueRange");
const hueRangeValue = document.getElementById("hueRangeValue");
const typeSelect = document.getElementById("type");
const typeLabel = document.getElementById("typeLabel");
const typeHint = document.getElementById("typeHint");
const randomizeButton = document.getElementById("randomize");

let listenersBound = false;
let hasInitialized = false;

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

function drawPendulum(x, y, size, depth, time, hueBase) {
  if (depth <= 0 || size < 3) return;

  const speed = (rotationSpeedDeg * Math.PI) / (180 * 1000);
  const swingBase = Math.sin(time * speed * 1.3 + depth * 0.35);
  const swing = swingBase * (0.9 + wobbleStrength * 0.9);
  const angleBase = Math.PI / 2 + swing;
  const hue = hueBase + depth * (hueRange / 12) + swing * (hueRange / 7);
  const stroke = hsla(hue, 86, 74, 0.92);
  const fill = hsla(hue + hueRange / 16, 68, 32, 0.24);

  drawHexagon(x, y, size, angleBase * 0.35, stroke, fill);

  const armLength = size * spacingFactor * 1.5;
  const childSize = size * shrinkFactor;
  const connectorSize = Math.max(3, size * 0.45);

  [-1, 1].forEach((direction, index) => {
    const phase = time + delayMs * (index + 0.5);
    const wobble = Math.sin(phase * 0.001 + depth * 0.2) * wobbleStrength;
    const armAngle = angleBase + direction * (Math.PI / 7 + wobble * 0.6);
    const midX = x + Math.cos(armAngle) * armLength * 0.55;
    const midY = y + Math.sin(armAngle) * armLength * 0.55;
    const endX = x + Math.cos(armAngle) * armLength;
    const endY = y + Math.sin(armAngle) * armLength;

    ctx.save();
    ctx.strokeStyle = hsla(hue + direction * 6, 70, 78, 0.85);
    ctx.lineWidth = Math.max(1.6, size * 0.06);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(midX, midY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();

    drawHexagon(midX, midY, connectorSize, armAngle + wobble * 0.5, stroke, fill);
    drawPendulum(endX, endY, childSize, depth - 1, phase, hueBase + hueRange / 14);
  });
}

function drawAurora(x, y, size, depth, time, hueBase) {
  const speed = (rotationSpeedDeg * Math.PI) / (180 * 1000);
  const bands = Math.max(3, depth);

  for (let i = 0; i < bands; i++) {
    const bandOffset = (i - (bands - 1) / 2) * size * 0.35;
    const wave = Math.sin(time * 0.0012 + i * 0.8) * size * wobbleStrength * 0.35;
    const bandY = y + bandOffset + wave;
    const bandHue = hueBase + i * (hueRange / bands);
    const segments = 6 + depth * 2;

    for (let j = 0; j <= segments; j++) {
      const progress = j / segments;
      const phase = time + delayMs * (progress + i * 0.15);
      const sway = Math.sin(phase * 0.0014 + progress * Math.PI * 2) * wobbleStrength;
      const posX = x + (progress - 0.5) * size * 2.1;
      const posY = bandY + Math.sin(progress * Math.PI * 2 + phase * 0.0009) * size * spacingFactor * 0.25;
      const localSize = Math.max(3, size * 0.32 * Math.pow(shrinkFactor, progress * depth * 0.6));
      const rotation = phase * speed * 0.45 + sway;
      const stroke = hsla(bandHue + progress * hueRange * 0.4, 78, 76, 0.82);
      const fill = hsla(bandHue + hueRange / 14, 70, 30, 0.18 + progress * 0.14);

      drawHexagon(posX, posY, localSize, rotation, stroke, fill);
    }
  }
}

function drawComet(x, y, size, depth, time, hueBase) {
  const speed = (rotationSpeedDeg * Math.PI) / (180 * 1000);
  const tailLength = Math.max(12, depth * 6);
  const angleBase = time * speed * 1.1;

  for (let i = 0; i < tailLength; i++) {
    const progress = i / tailLength;
    const spiral = angleBase + progress * Math.PI * 3.2;
    const wobble = Math.sin(time * 0.0016 + i * 0.7) * wobbleStrength;
    const radius = size * (0.4 + spacingFactor * progress * 2.1);
    const localSize = Math.max(3, size * (1 - progress * 0.82) * Math.pow(shrinkFactor, progress * depth));
    const localX = x + Math.cos(spiral + wobble) * radius;
    const localY = y + Math.sin(spiral + wobble) * radius;
    const hue = hueBase + progress * hueRange;
    const opacity = 0.9 - progress * 0.65;
    const stroke = hsla(hue, 84, 70, opacity);
    const fill = hsla(hue + hueRange / 18, 70, 32, opacity * 0.4);

    drawHexagon(localX, localY, localSize, spiral + wobble * 0.8, stroke, fill);
  }
}

function drawPrism(x, y, size, depth, time, hueBase) {
  const speed = (rotationSpeedDeg * Math.PI) / (180 * 1000);
  const grid = Math.max(2, depth - 2);
  const spacing = size * 0.38 * spacingFactor;

  for (let row = -grid; row <= grid; row++) {
    for (let col = -grid; col <= grid; col++) {
      const offsetX = (col + (row % 2 === 0 ? 0 : 0.5)) * spacing * 1.2;
      const offsetY = row * spacing * 0.9;
      const distance = Math.sqrt(offsetX ** 2 + offsetY ** 2);
      const tilt = time * speed * 0.4 + (row + col) * 0.18;
      const hue = hueBase + (row - col) * (hueRange / (grid * 3 + 4));
      const intensity = Math.max(0.25, 1 - distance / (size * 2.4));
      const localSize = Math.max(3, size * 0.28 * intensity);
      const stroke = hsla(hue, 82, 74, 0.8 * intensity + 0.2);
      const fill = hsla(hue + hueRange / 16, 68, 28, 0.16 + intensity * 0.2);

      drawHexagon(x + offsetX, y + offsetY, localSize, tilt, stroke, fill);
    }
  }
}

function drawBloom(x, y, size, depth, time, hueBase) {
  const speed = (rotationSpeedDeg * Math.PI) / (180 * 1000);
  const rings = Math.max(4, depth + 1);

  for (let r = 0; r < rings; r++) {
    const progress = r / rings;
    const ringRadius = size * (0.5 + spacingFactor * progress * 1.4 + Math.sin(time * 0.001 + r) * 0.08);
    const petals = 6 + r * 2;
    const petalSize = Math.max(3, size * Math.pow(shrinkFactor, r * 0.7));
    const hue = hueBase + progress * hueRange;
    const wobble = Math.sin(time * 0.0014 + r) * wobbleStrength;

    for (let p = 0; p < petals; p++) {
      const angle = (Math.PI * 2 * p) / petals + wobble * 0.6;
      const rotation = time * speed * 0.5 + angle;
      const stroke = hsla(hue + p * (hueRange / (petals * 2)), 86, 74, 0.88);
      const fill = hsla(hue + hueRange / 20, 70, 32, 0.2 + progress * 0.12);

      drawHexagon(
        x + Math.cos(angle) * ringRadius,
        y + Math.sin(angle) * ringRadius,
        petalSize,
        rotation,
        stroke,
        fill,
      );
    }
  }
}

function drawRipple(x, y, size, depth, time, hueBase) {
  const speed = (rotationSpeedDeg * Math.PI) / (180 * 1000);
  const ripples = Math.max(3, depth);

  for (let r = 0; r < ripples; r++) {
    const phase = (time / (delayMs * 10)) + r * 0.3;
    const wave = (phase % 1) * spacingFactor;
    const radius = size * (0.8 + wave * 2.1 + r * 0.22);
    const nodes = 10 + r * 2;
    const hue = hueBase + r * (hueRange / ripples);
    const alpha = Math.max(0.2, 0.9 - wave * 0.6);

    for (let n = 0; n < nodes; n++) {
      const angle = (Math.PI * 2 * n) / nodes + wave * Math.PI + Math.sin(time * 0.001 + n) * wobbleStrength * 0.3;
      const spin = time * speed * 0.3 + angle * 0.6;
      const localSize = Math.max(3, size * 0.24 * (1 - wave * 0.4));
      const stroke = hsla(hue + n * (hueRange / (nodes * 3)), 82, 72, alpha);
      const fill = hsla(hue + hueRange / 14, 68, 28, alpha * 0.4);

      drawHexagon(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, localSize, spin, stroke, fill);
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
    case "aurora":
      drawAurora(x, y, size, depth, time, hueBase);
      break;
    case "spiral":
      drawSpiral(x, y, size, depth, time, hueBase);
      break;
    case "concentric":
      drawConcentric(x, y, size, depth, time, hueBase);
      break;
    case "orbital":
      drawOrbital(x, y, size, depth, time, hueBase);
      break;
    case "pendulum":
      drawPendulum(x, y, size, depth, time, hueBase);
      break;
    case "comet":
      drawComet(x, y, size, depth, time, hueBase);
      break;
    case "prism":
      drawPrism(x, y, size, depth, time, hueBase);
      break;
    case "bloom":
      drawBloom(x, y, size, depth, time, hueBase);
      break;
    case "ripple":
      drawRipple(x, y, size, depth, time, hueBase);
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

function handleWobbleChange(value) {
  wobbleStrength = Number(value);
  wobbleStrengthValue.textContent = wobbleStrength.toFixed(2);
}

function handleDelayChange(value) {
  delayMs = Number(value);
  delayValue.textContent = `${delayMs}ms`;
}

function handleHueRangeChange(value) {
  hueRange = Number(value);
  hueRangeValue.textContent = `${hueRange}°`;
}

function randomFromSlider(slider) {
  const min = Number(slider.min);
  const max = Number(slider.max);
  const step = Number(slider.step);
  const steps = Math.round((max - min) / step);
  const decimals = slider.step.includes(".") ? slider.step.split(".")[1].length : 0;
  const value = min + step * Math.round(Math.random() * steps);
  return Number(value.toFixed(decimals));
}

function randomizeAllParams() {
  const randomParams = {
    depth: randomFromSlider(depthSlider),
    rotationSpeedDeg: randomFromSlider(rotationSpeedSlider),
    shrinkFactor: randomFromSlider(shrinkFactorSlider),
    spacingFactor: randomFromSlider(spacingSlider),
    wobbleStrength: randomFromSlider(wobbleStrengthSlider),
    delayMs: randomFromSlider(delaySlider),
    hueRange: randomFromSlider(hueRangeSlider),
  };

  applyParams(randomParams);
  seed = Math.random() * 360;
  startTime = performance.now();
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

  wobbleStrengthSlider.value = params.wobbleStrength;
  handleWobbleChange(params.wobbleStrength);

  delaySlider.value = params.delayMs;
  handleDelayChange(params.delayMs);

  hueRangeSlider.value = params.hueRange;
  handleHueRangeChange(params.hueRange);
}

function handleTypeChange(value) {
  const nextKey = typeConfigs[value] ? value : currentTypeKey;
  if (!typeConfigs[nextKey]) return;

  currentTypeKey = nextKey;
  typeSelect.value = currentTypeKey;
  const config = typeConfigs[currentTypeKey];
  typeLabel.textContent = config.label;
  typeHint.textContent = config.description;
  applyParams(config.params);
  seed = Math.random() * 360;
  startTime = performance.now();
}

function setupTypeOptions() {
  typeSelect.innerHTML = "";
  Object.entries(typeConfigs).forEach(([key, config]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = config.label;
    if (key === currentTypeKey) {
      option.selected = true;
    }
    typeSelect.appendChild(option);
  });
}

function bindEventListeners() {
  if (listenersBound) return;

  window.addEventListener("resize", resize);
  canvas.addEventListener("click", handleClick);
  depthSlider.addEventListener("input", (event) => handleDepthChange(event.target.value));
  rotationSpeedSlider.addEventListener("input", (event) => handleRotationChange(event.target.value));
  shrinkFactorSlider.addEventListener("input", (event) => handleShrinkChange(event.target.value));
  spacingSlider.addEventListener("input", (event) => handleSpacingChange(event.target.value));
  wobbleStrengthSlider.addEventListener("input", (event) => handleWobbleChange(event.target.value));
  delaySlider.addEventListener("input", (event) => handleDelayChange(event.target.value));
  hueRangeSlider.addEventListener("input", (event) => handleHueRangeChange(event.target.value));
  typeSelect.addEventListener("change", (event) => handleTypeChange(event.target.value));
  randomizeButton.addEventListener("click", randomizeAllParams);

  listenersBound = true;
}

function initializeApp() {
  if (hasInitialized) return;

  bindEventListeners();
  setupTypeOptions();
  typeSelect.value = currentTypeKey;
  handleTypeChange(currentTypeKey);
  resize();
  requestAnimationFrame(render);

  hasInitialized = true;
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp, { once: true });
} else {
  initializeApp();
}

window.fractalApp = {
  initialize: initializeApp,
  setupTypeOptions,
};
