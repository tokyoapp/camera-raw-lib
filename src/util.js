import { Texture } from "./gl/Texture.js";

export function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

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

export function wrapImageFileInTexture(file) {
	console.warn('not implemented');
	return new Texture(file);
}
