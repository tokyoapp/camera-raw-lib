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

export function pushImage(img) {
    processing.setSourceImage(img);
}

export function updatePreview(value) {
    processing.setAttribute('Saturation.saturation', value);
}
