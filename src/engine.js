import { fetchImageFile } from '../node_modules/photo-raw-lib/index.js';
import * as functions from './functions.js';
import { processingSteps } from './processing.js';
import { testWorkerCanvasSupport } from './util.js';
import { wrapWorker } from './worker/worker.js';

function executeAction(worker, action, args, transfers = []) {
    if(worker) {
        worker.do(action, args, transfers);
    } else {
        functions[action](...args);
    }
}

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

    for(let step of processingSteps) {
        for(let attr in step.attributes) {
            const attribute = step.attributes[attr];
    
            const label = document.createElement('label');
            label.innerHTML = attr;
        
            container.appendChild(label);

            const slider = document.createElement('input');
            slider.type = "range";
            slider.min = attribute.min;
            slider.max = attribute.max;
            slider.step = 0.00001;
        
            container.appendChild(slider);
    
            slider.oninput = e => {
                executeAction(worker, 'updatePreview', [step.name + '.' + attr, slider.valueAsNumber]);
            }
        }
    }

    let worker;

    if(await testWorkerCanvasSupport()) {
        worker = wrapWorker(
            new Worker('../src/worker/worker.js', { type: 'module' })
        );

        const imageFileData = await fetchImageFile('../../node_modules/photo-raw-lib/res/_MG_2834.CR2');
        const image = imageFileData.images[2];

        const offscreen = canvas.transferControlToOffscreen();
        const test = await worker.do('testWebGL', [offscreen], [offscreen]);
        console.log('worker thread', test);

        worker.do('setSourceImage', [ image.imageData, image.width, image.height, image.bitsPerSample[0] ]);
    } else {
        // non worker option example
        const test = functions.testWebGL(canvas);
        console.log('in main thread', test);
    }

})()
