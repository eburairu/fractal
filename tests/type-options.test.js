const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const htmlPath = path.join(__dirname, '..', 'index.html');

const expectedValues = [
  'classic',
  'spiral',
  'concentric',
  'lattice',
  'pendulum',
  'aurora',
  'comet',
  'prism',
  'bloom',
  'ripple',
];

async function createDom() {
  const dom = await JSDOM.fromFile(htmlPath, {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    beforeParse(window) {
      const noop = () => {};
      window.HTMLCanvasElement.prototype.getContext = () => ({
        setTransform: noop,
        scale: noop,
        save: noop,
        translate: noop,
        rotate: noop,
        beginPath: noop,
        moveTo: noop,
        lineTo: noop,
        closePath: noop,
        fill: noop,
        stroke: noop,
        restore: noop,
        fillRect: noop,
      });
      window.requestAnimationFrame = noop;
    },
  });

  await new Promise((resolve) => {
    dom.window.addEventListener('load', resolve);
  });

  return dom;
}

function getOptionValues(select) {
  return Array.from(select.options).map((option) => option.value);
}

test('type dropdown remains unique after repeated setup and initialization', async () => {
  const dom = await createDom();
  const { document, fractalApp } = dom.window;
  const typeSelect = document.getElementById('type');

  assert.deepEqual(getOptionValues(typeSelect), expectedValues);

  // ダミーの重複を混ぜてから再セットアップしても一意性が保たれることを確認
  typeSelect.appendChild(new dom.window.Option('重複', 'classic'));
  assert.equal(typeSelect.options.length, expectedValues.length + 1);

  fractalApp.setupTypeOptions();
  assert.deepEqual(getOptionValues(typeSelect), expectedValues);

  // 二重初期化されてもオプションが増えないことを確認
  fractalApp.initialize();
  assert.deepEqual(getOptionValues(typeSelect), expectedValues);
});
