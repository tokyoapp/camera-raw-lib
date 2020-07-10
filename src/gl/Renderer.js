import { Geometry } from './Geometry.js';
import { ImageShader } from './ImageShader.js';
import { Shader } from "./RendererShader.js";
import { Texture } from './Texture.js';

const TEXTURE = {
	EMPTY: 0,
	BACKGROUND: 1,
	PLACEHOLDER: 2,
}

const SCREEN = new Geometry({
	vertecies: [
		[-1, -1, 0],
		[1, -1, 0],
		[1, 1, 0],
		[1, 1, 0],
		[-1, 1, 0],
		[-1, -1, 0],
	],
	uvs: [
		[0, 0],
		[1, 0],
		[1, 1],
		[1, 1],
		[0, 1],
		[0, 0],
	]
});

export class Renderer {

	// canvas sizes
	get width() { return this.gl.canvas.width; }
	get height() { return this.gl.canvas.height; }
	get aspectratio() { return this.width / this.height; }

	onCreate() {
		this.clearPass = true;
		this.debug = true;
		this.textures = {};
		this.vertexBuffers = new Map();
		this.background = [0, 0, 0, 0];
		this.screen = SCREEN;
		this.shader = new ImageShader();
		this.source = null;
		this.info = {
			drawTime: 0,
		};

		this.rotation = 0;
	}

	clearBuffers() {
		this.vertexBuffers = new Map();
		this.textures = {};
	}

	setShader(shader) {
		this.shader = shader;
	}

	draw() {
		const time = performance.now();

		if(this.clearPass) {
			this.gl.clearColor(...this.background);
			this.clear();
		}

		this.useShader(this.shader);

		if(this.source) {
			this.setTexture(this.prepareTexture(this.source), this.gl.TEXTURE_2D, TEXTURE.BACKGROUND, 'imageTexture');
		}
		
		const custom = this.currentShader.customUniforms;
		if(custom) {
			this.currentShader.setUniforms(custom);
		}

		const angleToRotateInRadians = this.rotation * Math.PI / 180;
		const s = Math.sin(angleToRotateInRadians);
		const c = Math.cos(angleToRotateInRadians);

		this.currentShader.setUniforms({
			modelMatrix: [
				c, -s, 0, 0,
				s, c, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1,
			]
		});

		this.drawGeo(this.screen, this.currentShader.drawmode);

		this.info.drawTime = performance.now() - time;
	}

	prepareTexture(texture) {
		if(!texture.uid) {
			throw new Error('Texture not valid');
		}

		if(!this.textures[texture.uid]) {
			const newTexture = this.createTexture(texture);
			this.textures[texture.uid] = newTexture;
		}
		return this.textures[texture.uid];
	}

	getTextureBuffer(texture) {
		return this.textures[texture.uid];
	}

	getGemoetryBuffer(geo) {
		if(!this.vertexBuffers.has(geo.uid)) {
			this.vertexBuffers.set(geo.uid, geo.createBuffer());
		}
		return this.vertexBuffers.get(geo.uid);
	}

	onDestory() {
		// on create method
	}

	constructor(canvas, contextOptions = {
		alpha: false,
		premultipliedAlpha: false,
		antialias: true,
		preserveDrawingBuffer: true, // possible if using a offscreen canvas
	}) {
		if (!canvas) throw "RendererContext: Err: no canvas";

		this.contextOptions = contextOptions;
		this.canvas = canvas;
		this.debug = true;
		this.currentShader = null;
		this.shaders = new Map();

		this.options = {
			DEPTH_TEST: false,
			CULL_FACE: false,
			BLEND: false,
		}

		this.initialize();
	}

	initialize() {
		this.getContext(this.canvas);
		this.onCreate();

		// enable gl options
		this.setOptions(this.options);
	}

	setOptions(options) {
		for (let opt in options) {
			if (options[opt] === true) {
				this.gl.enable(this.gl[opt]);
			} else if(options[opt] === false) {
				this.gl.disable(this.gl[opt]);
			}
		}
	}

	// set viewport resolution
	viewport(width, height) {
		this.gl.viewport(0, 0, width, height);
	}

	// set canvas and viewport resolution
	setResolution(width, height) {
		this.gl.canvas.width = width;
		this.gl.canvas.height = height;
		this.viewport(width, height);
	}

	// clear framebuffer
	clear() {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	}

	// get webgl context from canvas
	getContext(canvas) {
		this.canvas = canvas;

		const ctxtOpts = this.contextOptions;
		this.gl = canvas.getContext("webgl2", ctxtOpts);

		this.gl.cullFace(this.gl.BACK);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
	}

	// use webgl shader
	useShader(shader) {
		if (!shader.initialized) {
			this.prepareShader(shader);
		}
		if(this.currentShader !== shader) {
			this.gl.useProgram(shader.program);
			this.currentShader = shader;
		}
	}

	setTexture(gltexture, type, slot, uniformStr) {
		this.gl.activeTexture(this.gl["TEXTURE" + slot]);
		this.gl.bindTexture(type, gltexture);

		if (uniformStr) {
			this.gl.uniform1i(this.currentShader.uniforms[uniformStr], slot);
		}
	}

	// initialize webgl shader
	prepareShader(shader) {
		const gl = this.gl;

		if (shader instanceof Shader) {

			if (shader.source) {
				shader._vertShader = this.compileShader(shader.source[0], gl.VERTEX_SHADER);
				shader._fragShader = this.compileShader(shader.source[1], gl.FRAGMENT_SHADER);

				shader.program = this.createProgram(shader._vertShader, shader._fragShader);
				shader.gl = gl;

				shader._uniforms = this.getUniforms(shader.program);
				shader._attributes = this.getAttributes(shader.program);

				shader.initialized = true;

				let counter = 1;
				while (this.shaders.has(shader.constructor.name + counter)) {
					counter++;
				}
				this.shaders.set(shader.constructor.name + counter, shader);
			}

			return shader.program;
		}
	}

	// get attributes from shader program
	getAttributes(program) {
		const gl = this.gl;
		const attributes = {};

		const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
		for (let i = 0; i < numAttributes; ++i) {
			const name = gl.getActiveAttrib(program, i).name;
			attributes[name] = gl.getAttribLocation(program, name);
		}

		return attributes;
	}

	// get uniforms from shader program
	getUniforms(program) {
		const gl = this.gl;
		const uniforms = {};
		const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
		for (let i = 0; i < numUniforms; ++i) {
			const name = gl.getActiveUniform(program, i).name;
			uniforms[name] = gl.getUniformLocation(program, name);
		}
		return uniforms;
	}

	// compile glsl shader
	compileShader(src, type) {
		const gl = this.gl;
		const shader = gl.createShader(type);
		gl.shaderSource(shader, src);
		gl.compileShader(shader);

		if (this.debug) {
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				throw new Error(gl.getShaderInfoLog(shader));
			}
		}

		return shader;
	}

	// use vertex array object
	useVAO(VAO) {
		this.gl.bindVertexArray(VAO);
	}

	// create vertex array object for buffer
	createVAO(buffer) {
		const VAO = this.gl.createVertexArray();
		this.gl.bindVertexArray(VAO);

		this.initializeBuffersAndAttributes(buffer);

		return VAO;
	}

	// create shader program
	createProgram(vertShader, fragShader) {
		const gl = this.gl;
		const program = gl.createProgram();
		gl.attachShader(program, vertShader);
		gl.attachShader(program, fragShader);
		gl.linkProgram(program);

		if (this.debug) {
			if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
				throw new Error(gl.getProgramInfoLog(program));
			}
		}

		return program;
	}

	// update webgl texture
	updateTextureBuffer(textureObject) {
		const gl = this.gl;
		const gltexture = this.getTextureBuffer(textureObject);

		const imageData = textureObject.getImageData();
		const internal_format = textureObject.internal_format;
		const format = textureObject.format;
		const type = textureObject.type;

		gl.bindTexture(gl.TEXTURE_2D, gltexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl[internal_format], image.width, image.height, 0, gl[format], gl[type], imageData);
	}

	// create webgl texture
	createTexture(textureObject) {
		const gl = this.gl;

		const imageData = textureObject.getImageData();

		const {
			mag_filter,
			min_filter,
			wrap_s,
			wrap_t,
			internal_format,
			format,
			type,
			width, 
			height
		} = textureObject;

		const texture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, texture);

		gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.gl[mag_filter]);
		gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.gl[min_filter]);
		gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.gl[wrap_s]);
		gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.gl[wrap_t]);

		// void gl.texImage2D(target, level, internalformat, width, height, border, format, type, GLintptr offset);

		gl.texImage2D(
			gl.TEXTURE_2D, 
			0, 
			gl[internal_format], 
			width, 
			height, 
			0, 
			gl[format], 
			gl[type], 
			imageData
		);

		return texture;
	}

	// prepare geometry buffers for draw
	initializeBuffersAndAttributes(bufferInfo) {
		const gl = this.gl;
		const attributes = this.currentShader.attributes;

		// exit if verts are meptyy
		if (bufferInfo.vertecies.length < 1) return;

		const newbuffer = !bufferInfo.indexBuffer || !bufferInfo.vertexBuffer;

		// create new buffers
		if (newbuffer) {
			bufferInfo.indexBuffer = gl.createBuffer();
			bufferInfo.vertexBuffer = gl.createBuffer();

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indexBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indecies, gl.STATIC_DRAW);

			gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.vertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, bufferInfo.vertecies, gl.STATIC_DRAW);

		} else {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indexBuffer);
			gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.vertexBuffer);
		}

		const bpe = bufferInfo.vertecies.BYTES_PER_ELEMENT;

		let lastAttrSize = 0;

		const bufferAttributes = bufferInfo.attributes;

		for (let i = 0; i < bufferInfo.attributes.length; i++) {
			gl.vertexAttribPointer(
				attributes[bufferAttributes[i].attribute],
				bufferAttributes[i].size,
				gl.FLOAT,
				false,
				bufferInfo.elements * bpe,
				lastAttrSize * bpe
			);
			gl.enableVertexAttribArray(attributes[bufferAttributes[i].attribute]);

			lastAttrSize += bufferAttributes[i].size;
		}
	}

	destroy() {
		this.onDestory();

		const gl = this.gl;

		for(let [_, fb] of this.framebuffers) {
			gl.deleteTexture(fb.textures.color);
			gl.deleteTexture(fb.textures.depth);

			gl.deleteFramebuffer(fb.framebuffers.DRAW);
			gl.deleteFramebuffer(fb.framebuffers.OUTPUT);
			
			gl.deleteRenderbuffer(fb.colorRenderbuffer);
		}

		for(let [_, shader] of this.shaders) {
			gl.deleteProgram(shader.program);
		}
	}

	readPixel(x, y) {
		const data = new Uint8Array(4);
		this.gl.readPixels(x, y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, data);
		return data;
	}
	
	drawGeo(geo, drawmode) {

		const buffer = this.getGemoetryBuffer(geo);

		if (!buffer.vao) {			
			buffer.vao = this.createVAO(buffer);
		}

		this.useVAO(buffer.vao);

		const gl = this.gl;

		if (buffer.indecies.length > 0) {
			gl.drawElements(gl[drawmode], buffer.indecies.length, gl.UNSIGNED_SHORT, 0);
		} else {
			gl.drawArrays(gl[drawmode], 0, buffer.vertecies.length / buffer.elements);
		}
	}
}
