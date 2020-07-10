import { fetchImageFile } from '../node_modules/photo-raw-lib/index.js';
import * as functions from './functions.js';
import processingSteps from './processing/index.js';
import { wrapWorker } from './worker/worker.js';

async function testWorkerCanvasSupport() {
	const worker = new Worker('data:application/js,' + escape(`
		onmessage = function() {
			const test = 'OffscreenCanvas' in globalThis;
			postMessage(test);
		}
	`));

	return new Promise((resolve) => {
		worker.onmessage = e => {
			worker.terminate();
			resolve(e.data);
		}
		worker.postMessage(0);
	})
}

function executeAction(worker, action, args, transfers = []) {
  if (worker) {
    worker.do(action, args, transfers);
  } else {
    functions[action](...args);
  }
}

function makeUI(container, worker) {
  for (let step of processingSteps) {
    for (let attr in step.attributes) {
      const attribute = step.attributes[attr];

      const label = document.createElement('label');
      label.innerHTML = attr;

      container.appendChild(label);

      const slider = document.createElement('input');
      slider.type = "range";
      slider.step = 0.00001;
      slider.min = attribute.min;
      slider.max = attribute.max;
      slider.value = attribute.value;

      container.appendChild(slider);

      slider.oninput = e => {
        executeAction(worker, 'updatePreview', [step.name + '.' + attr, slider.valueAsNumber]);
      }
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

  let worker;
  
  const imageFile = await fetchImageFile('../../node_modules/photo-raw-lib/res/_MG_0002.ARW');
  console.log(imageFile);

  const data = await imageFile.getImageData();
  console.log(data);

  if (await testWorkerCanvasSupport()) {
    worker = wrapWorker(
      new Worker('../src/worker/worker.js', { type: 'module' })
    );

    await worker.loadFunctions('../functions.js');

    makeUI(container, worker);

    const offscreen = canvas.transferControlToOffscreen();
    const test = await worker.do('testWebGL', [offscreen], [offscreen]);
    console.info('processing in worker thread');

    executeAction(worker, 'setSourceImage', [data]);
  } else {
    makeUI(container);
    // non worker option example
    const test = executeAction(worker, 'testWebGL', [canvas]);
    console.info('processing in main thread');

    executeAction(worker, 'setSourceImage', [data]);
  }

})()
