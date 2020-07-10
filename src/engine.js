import * as functions from './functions.js';
import { wrapWorker } from './worker/worker.js';
import { testWorkerCanvasSupport } from './util.js';
import { fetchImageFile } from '../node_modules/photo-raw-lib/index.js';
import JPEG from '../node_modules/photo-raw-lib/src/JPEG.mjs';

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
    slider.max = 1;
    slider.step = 0.01;

    container.appendChild(slider);

    let worker;

    function executeAction(action, args, transfers = []) {
        if(worker) {
            worker.do(action, args, transfers);
        } else {
            functions[action](...args);
        }
    }

    if(await testWorkerCanvasSupport()) {
        worker = wrapWorker(
            new Worker('../src/worker/worker.js', { type: 'module' })
        );

        const imageFileData = await fetchImageFile('../../node_modules/photo-raw-lib/res/_MG_2834.CR2');
        const image = imageFileData.images[0];
        const img = await JPEG.decompress(image.imageData, image);

        const offscreen = canvas.transferControlToOffscreen();
        const test = await worker.do('testWebGL', [offscreen], [offscreen]);
        console.log('worker thread', test);
    
        slider.oninput = e => {
            executeAction('updatePreview', [slider.valueAsNumber]);
        }

        worker.do('pushImage', [ await createImageBitmap(img) ]);
    } else {
        const test = functions.testWebGL(canvas);
        console.log('in main thread', test);

        slider.oninput = e => {
            executeAction('updatePreview', [slider.valueAsNumber]);
        }
    }

})()
