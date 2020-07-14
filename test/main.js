import { ImageEngine } from '../src/ImageEngine.js';
import processingSteps from '../src/processing/index.js';
import { wrapWorker } from '../src/worker.js';

const worker = wrapWorker(new Worker('../src/worker.js', { type: 'module' }));

function makeUI(container, worker) {
  for (let step of processingSteps) {
    for (let attr in step.attributes) {
      const attribute = step.attributes[attr];

      const label = document.createElement('label');
      label.innerHTML = attr;

      container.appendChild(label);

      const defaultValue = attribute.value;

      const slider = document.createElement('input');
      slider.type = "range";
      slider.step = 0.00001;
      slider.min = attribute.min;
      slider.max = attribute.max;
      slider.value = attribute.value;

      slider.ondblclick = () => {
        slider.value = defaultValue;
        worker.do('setAttribute', [step.name + '.' + attr, slider.valueAsNumber]);
      }

      slider.oninput = e => {
        worker.do('setAttribute', [step.name + '.' + attr, slider.valueAsNumber]);
      }

      container.appendChild(slider);
    }
  }
}

(async function () {
  const container = document.createElement('div');
  container.className = "container";
  document.body.appendChild(container);

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  canvas.style.maxWidth = "100%";
  canvas.style.background = 'black';
  canvas.style.gridColumn = "2";

  document.body.appendChild(canvas);

  const offscreen = canvas.transferControlToOffscreen();
  worker.do('init', [offscreen], [offscreen])

  makeUI(container, worker);

  const image = await worker.do('loadImage', ['../../res/_MG_0001.CR3']);
})()
