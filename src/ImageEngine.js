import { parseImageFile } from './files/index.js';
import * as functions from './functions.js';
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


export class ImageEngine {

  constructor() {
    this.worker = null;
  }

  async setup(canvas) {
    if (await testWorkerCanvasSupport()) {
      this.worker = wrapWorker(
        new Worker('../src/worker/worker.js', { type: 'module' })
      );

      await this.worker.loadFunctions('../functions.js');

      console.info('processing in worker thread');

      const offscreen = canvas.transferControlToOffscreen();
      this.execute('init', [offscreen], [offscreen]);
    } else {
      // non worker option example
      console.info('processing in main thread');

      this.execute('init', [canvas]);
    }
  }

  async loadImage(blob) {
    const imageFile = await parseImageFile(blob.url, blob);
    const data = await imageFile.getImageData();
    this.execute('setSourceImage', [data]);
  }

  execute(action, args, transfers = []) {
    if (this.worker) {
      this.worker.do(action, args, transfers);
    } else {
      functions[action](...args);
    }
  }

}
