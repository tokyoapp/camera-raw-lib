import { Texture } from './gl/Texture.js';
import { ImageProcessing } from './image/ImageProcessing.js';
import { processingSteps } from './processing.js';

let processing;

export function testWebGL(canvas) {
    processing = new ImageProcessing(canvas);

    // setup before compile
    for(let step of processingSteps) {
        processing.addProcessingStep(step);
    }

    processing.draw();
}

export function setSourceImage(imageData, width, height, bitsPerSample) {
    processing.setSourceImage(imageData, width, height, bitsPerSample);
}

export function updatePreview(path, value) {
    processing.setAttribute(path, value);
}
