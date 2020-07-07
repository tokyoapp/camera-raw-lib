import { Renderer } from './gl/Renderer.js';
import { ImageShader } from './gl/ImageShader.js';

class Processing {
    
    processes = [];
    
    setAttribute(path, value) {
        const name = path.split('.')[0];
        const attrib = path.split('.')[1];

        for(let step of this.processes) {
            if(step.name == name) {
                step.attributes[attrib] = value;
            }
        }
    }

    addProcessing(options) {
        this.processes.push(options);
    }

    generateFragmentShaderSource() {
        return `#version 300 es

			precision mediump float;
			
			uniform sampler2D imageTexture;

			in vec2 texCoords;

            out vec4 oFragColor;
            
            ${this.processes.map(step => {
                return step.glsl;
            })}

            void main () {
				vec2 uv = vec2(
					texCoords.x,
					-texCoords.y
				);

                oFragColor = vec4(texture(imageTexture, uv));

                oFragColor.r = 1.0;
                
                ${this.processes.map(step => {
                    return `${step.name}(oFragColor);`;
                })}
            }
        `.replace(/^\s+/gm, '');
    }

    prepareShader(shader) {
        const fragmentSource = processing.generateFragmentShaderSource();
        shader.setFragmentSource(fragmentSource);

        // set shader.customUniforms
        const uniformValues = shader.customUniforms;

        for(let step of this.processes) {
            for(let attrib in step.attributes) {
                uniformValues[attrib] = step.attributes[attrib];
            }
        }
    }

    createShader() {
        const shader = new ImageShader();
        processing.prepareShader(shader);
        return shader;
    }
}

const processing = new Processing();

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

// setup before compile
for(let step of processingSteps) {
    processing.addProcessing(step);
}

// change dynamicly withou recompiling
processing.setAttribute('Saturation.saturation', 0.5);

let renderer;
const shader = processing.createShader();

export function testWebGL(canvas) {
    renderer = new Renderer(canvas);
    renderer.setShader(shader);
    renderer.draw();
    return renderer.info;
}

export function updatePreview(value) {
    processing.setAttribute('Saturation.saturation', value);
    draw();    
}

const DEBOUNCE_DELAY = 50;

let queued = false;

function draw() {
    if(!queued) {
        queued = true;
        setTimeout(() => {
            queued = false;

            processing.prepareShader(shader);
            renderer.draw();
        }, DEBOUNCE_DELAY);
    }
}
