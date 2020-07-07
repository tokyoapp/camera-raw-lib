import * as functions from './functions.js';
import { wrapWorker } from './worker/worker.js';
import { testWorkerCanvasSupport } from './util.js';

(async function() {

    const canvas = document.createElement('canvas');
    canvas.width = 5400;
    canvas.height = 5400 / 1.7777;
    canvas.style.maxWidth = "100%";
    canvas.style.background = 'lime';

    document.body.appendChild(canvas);

    if(await testWorkerCanvasSupport()) {
        const worker = wrapWorker(
            new Worker('../src/worker/worker.js', { type: 'module' })
        );

        const offscreen = canvas.transferControlToOffscreen();
        const test = await worker.do('testWebGL', [offscreen], [offscreen]);
        console.log('worker thread', test);
    } else {
        const test = functions.testWebGL(canvas);
        console.log('in main thread', test);
    }

})()
