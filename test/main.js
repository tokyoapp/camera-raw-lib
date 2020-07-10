import { ImageEngine } from '../src/ImageEngine.js';
import processingSteps from '../src/processing/index.js';

function makeUI(container, engine) {
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
        engine.setAttribute(step.name + '.' + attr, slider.valueAsNumber);
      }

      slider.oninput = e => {
        engine.setAttribute(step.name + '.' + attr, slider.valueAsNumber);
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

  const imageBlob = await fetch('../../res/_MG_2834.CR2');
  const engine = new ImageEngine();
  engine.setup(canvas);
  engine.loadImage(imageBlob);

  makeUI(container, engine);
})()
