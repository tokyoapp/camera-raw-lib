import { ImageProcessing } from './image/ImageProcessing.js';
import processingSteps from './processing/index.js';

let processing;

const functions = {

  init(canvas) {
      processing = new ImageProcessing(canvas);
  
      // setup before compile
      for(let step of processingSteps) {
          processing.addProcessingStep(step);
      }
  },
  
  loadImage(image) {
      processing.loadImage(image);
  },
  
  setAttribute(path, value) {
      processing.setAttribute(path, value);
  }
  
};

async function runFunction(action, args) {
  if (action in functions) {
    return functions[action](...args);
  } else {
    console.error(`function "${action}" not found`);
  }
}

onmessage = async e => {
  const action = e.data.action;
  const process_id = e.data.id;
  const args = e.data.args;

  runFunction(action, args).then(result => {
    postMessage({ id: process_id, result });
  })
}

//
// Function exports for worker use, temporarly stored here
//

export async function testWorkerCanvasSupport() {
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

function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

export function wrapWorker(worker) {
  worker.do = (action, args = [], transferList = []) => {
    return new Promise((resolve, reject) => {
      const process_id = uuidv4();

      const handleMessage = e => {
        if (e.data.id === process_id) {
          resolve(e.data.result);
          worker.removeEventListener('message', handleMessage);
        }
      }

      worker.addEventListener('message', handleMessage);
      worker.postMessage({ id: process_id, action, args }, transferList);
    })
  }
  return worker;
}
