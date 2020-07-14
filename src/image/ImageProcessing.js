import { ImageShader } from '../gl/ImageShader.js';
import { Renderer } from '../gl/Renderer.js';
import { Texture } from '../gl/Texture.js';

export class ImageProcessing {

  constructor(canvas) {
    this.renderer = new Renderer(canvas);

    this.debounceDelay = 1000 / 24;
    this.processes = [];
    this.queued = false;
  }

  loadImage(image) {
    if (image.orientation == 8) {
      this.renderer.rotation = 90;
      this.renderer.setResolution(image.height, image.width);
    } else {
      this.renderer.setResolution(image.width, image.height);
    }

    this.renderer.source = new Texture(image);
    this.draw();
  }

  draw() {
    if (!this.shader) {
      this.compile();
    }

    if (!this.queued) {
      this.queued = true;

      this.prepareShader(this.shader);
      this.renderer.draw();

      setTimeout(() => {
        this.queued = false;
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

    for (let step of this.processes) {
      if (step.name == name) {
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

    for (let step of this.processes) {
      const attribs = Object.keys(step.attributes);
      attributes.push(...attribs.map(attr => {
        const type = step.attributes[attr].type;
        return `uniform ${type} ${attr};`;
      }));
    }

    return `#version 300 es

			precision mediump float;
			
      uniform sampler2D imageTexture;

      ${attributes.join("\n")}

			in vec2 texCoords;

      out vec4 oFragColor;
            
      ${this.processes.map(step => step.glsl).join("\n")}

      void main () {
				vec2 uv = vec2(
					texCoords.x,
					-texCoords.y
				);

        oFragColor = vec4(texture(imageTexture, uv));
                
        ${this.processes.map(step => `${step.name}(oFragColor);`).join("\n")}
      }
    `.replace(/^\s+/gm, '');
  }

  prepareShader(shader) {
    const fragmentSource = this.generateFragmentShaderSource();
    shader.setFragmentSource(fragmentSource);

    // set shader.customUniforms
    const uniformValues = shader.customUniforms;

    for (let step of this.processes) {
      for (let attrib in step.attributes) {
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
