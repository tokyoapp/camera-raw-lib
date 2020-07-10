import { ImageProcessing } from './image/ImageProcessing.js';
import processingSteps from './processing/index.js';

let processing;

export function testWebGL(canvas) {
    processing = new ImageProcessing(canvas);

    // setup before compile
    for(let step of processingSteps) {
        processing.addProcessingStep(step);
    }
}

export function setSourceImage(image) {
    processing.setSourceImage(image);
}

export function updatePreview(path, value) {
    processing.setAttribute(path, value);
}
