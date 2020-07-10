import { ImageShader } from '../gl/ImageShader.js';
import { Renderer } from '../gl/Renderer.js';
import { Texture } from '../gl/Texture.js';

export class ImageProcessing {
    
    debounceDelay = 30;
    processes = [];
    queued = false;

    constructor(canvas) {
        this.renderer = new Renderer(canvas);
    }

    setSourceImage(image) {
        this.renderer.setImage(image);
        this.draw();
    }

    draw() {
        if(!this.shader) {
            this.compile();
        }

        if(!this.queued) {
            this.queued = true;
            setTimeout(() => {
                this.queued = false;
                this.prepareShader(this.shader);
                this.renderer.draw();
            }, this.debounceDelay);
        }
    }

    compile() {
        this.shader = this.createShader();
        this.renderer.setShader(this.shader);
    }
    
    setAttribute(path, value) {
        const name = path.split('.')[0];
        const attrib = path.split('.')[1];

        for(let step of this.processes) {
            if(step.name == name) {
                step.attributes[attrib].value = value;
            }
        }

        this.draw();
    }

    addProcessingStep(options) {
        this.processes.push(options);
    }

    generateFragmentShaderSource() {
        const attributes = [];

        for(let step of this.processes) {
            const attribs = Object.keys(step.attributes);
            attributes.push(...attribs.map(attr => {
                const type = step.attributes[attr].type;
                return `uniform ${type} ${attr};`;
            }));
        }

        return `#version 300 es

			precision mediump float;
			
            uniform sampler2D imageTexture;

            ${attributes}

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
                
                ${this.processes.map(step => {
                    return `${step.name}(oFragColor);`;
                })}
            }
        `.replace(/^\s+/gm, '');
    }

    prepareShader(shader) {
        const fragmentSource = this.generateFragmentShaderSource();
        shader.setFragmentSource(fragmentSource);

        // set shader.customUniforms
        const uniformValues = shader.customUniforms;

        for(let step of this.processes) {
            for(let attrib in step.attributes) {
                uniformValues[attrib] = step.attributes[attrib].value;
            }
        }
    }

    createShader() {
        const shader = new ImageShader();
        this.prepareShader(shader);
        return shader;
    }
}
