import * as functions from '../functions.js';
import { uuidv4 } from '../util.js';

const INSIDE_WORKER = globalThis.constructor.name == "DedicatedWorkerGlobalScope";

if(INSIDE_WORKER) {
  onmessage = async e => {
    const action = e.data.action;
    const id = e.data.id;
    const args = e.data.args;
  
    runFunction(action, args).then(result => {
      postMessage({ id, result });
    })
  }
}

async function runFunction(action, args) {
  if (action in functions) {
    return await functions[action](...args);
  } else {
    console.error(`function "${action}" not found`);
  }
}

export function wrapWorker(worker) {

  worker.do = (action, args = [], transferList = []) => {
    const process_id = uuidv4();

    return new Promise((resolve, reject) => {

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

  worker.onerror = (err) => {
    console.error('[Error in worker]', err.message);
  }

  return worker;
}
