import { Renderer } from './gl/Renderer.js';
import { ImageProcessing } from './image/ImageProcessing.js';

let processing;

const processingSteps = [
    {
        name: 'Saturation',
        attributes: {
            saturation: 1.0
        },
        glsl: `
            uniform float saturation;
            
            void Saturation(inout vec4 outColor) {
                outColor.r *= saturation;
            }
        `
    }
]

export function testWebGL(canvas) {
    processing = new ImageProcessing(canvas);

    // setup before compile
    for(let step of processingSteps) {
        processing.addProcessingStep(step);
    }

    processing.draw();
}

export function updatePreview(value) {
    processing.setAttribute('Saturation.saturation', value);
}
