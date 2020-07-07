import * as functions from './functions.js';
import { wrapWorker } from './worker/worker.js';
import { testWorkerCanvasSupport } from './util.js';

(async function() {

    const container = document.createElement('div');
    container.className = "container";
    document.body.appendChild(container);

    const canvas = document.createElement('canvas');
    canvas.width = 5400;
    canvas.height = 5400 / 1.7777;
    canvas.style.maxWidth = "100%";
    canvas.style.background = 'lime';

    canvas.style.gridColumn = "2";

    document.body.appendChild(canvas);
    
    const label = document.createElement('label');
    label.innerHTML = "Saturation";

    container.appendChild(label);

    const slider = document.createElement('input');
    slider.type = "range";
    slider.min = 0;
    slider.max = 2;
    slider.step = 0.01;

    container.appendChild(slider);

    if(await testWorkerCanvasSupport()) {
        const worker = wrapWorker(
            new Worker('../src/worker/worker.js', { type: 'module' })
        );

        const offscreen = canvas.transferControlToOffscreen();
        const test = await worker.do('testWebGL', [offscreen], [offscreen]);
        console.log('worker thread', test);
    
        slider.oninput = e => {
            worker.do('updatePreview', [slider.valueAsNumber]);
        }
    } else {
        const test = functions.testWebGL(canvas);
        console.log('in main thread', test);

        slider.oninput = e => {
            functions.updatePreview(slider.valueAsNumber);
        }
    }

})()
