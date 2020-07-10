const functions = {
  loadFunctions(filePath) {
    return import(filePath).then(obj => {
      for(let key in obj) {
        functions[key] = obj[key];
      }
    });
  }
};

export function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

const INSIDE_WORKER = globalThis.constructor.name == "DedicatedWorkerGlobalScope";

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

  worker.loadFunctions = filePath => {
    return worker.do('loadFunctions', [filePath]);
  }

  worker.onerror = (err) => {
    console.error('[Error in worker]', err.message);
  }

  return worker;
}

if(INSIDE_WORKER) {

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
}
