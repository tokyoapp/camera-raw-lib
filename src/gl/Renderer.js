import { Geometry } from './Geometry.js';
import { ImageShader } from './ImageShader.js';
import { RendererContext } from './RendererContext.js';
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
	],
	normals: [
		[-1, -1, 0],
		[1, -1, 0],
		[1, 1, 0],
		[1, 1, 0],
		[-1, 1, 0],
		[-1, -1, 0],
	],
});

export class Renderer extends RendererContext {

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
	}

	clearBuffers() {
		this.vertexBuffers = new Map();
		this.textures = {};
	}

	setImage(image) {
		this.setResolution(image.width, image.height);
		this.source = new Texture(image);
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

		this.drawGeo(this.screen, this.currentShader.drawmode);

		this.info.drawTime = performance.now() - time;
	}

	prepareTexture(texture) {
		if(!texture.uid) {
			throw new Error('Texture not valid');
		}

		if(!this.textures[texture.uid]) {
			let newTexture = null;

			if(texture.format) {
				newTexture = this.createCompressedTexture(texture);
			} else {
				newTexture = this.createTexture(texture.image, {
					TEXTURE_WRAP_S: texture.wrap_s,
					TEXTURE_WRAP_T: texture.wrap_t,
					TEXTURE_MAG_FILTER: texture.mag_filter,
					TEXTURE_MIN_FILTER: texture.min_filter,
				});
			}

			this.textures[texture.uid] = newTexture;
		}
		return this.textures[texture.uid];
	}

	getGemoetryBuffer(geo) {
		if(!this.vertexBuffers.has(geo.uid)) {
			this.vertexBuffers.set(geo.uid, geo.createBuffer());
		}
		return this.vertexBuffers.get(geo.uid);
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
