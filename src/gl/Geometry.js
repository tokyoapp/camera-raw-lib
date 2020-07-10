import { Transform, uuidv4 } from "./Math.js";

export class Geometry extends Transform {

	static get attributes() {
		return [
			{ size: 3, attribute: "aPosition" },
			{ size: 2, attribute: "aTexCoords" },
			{ size: 3, attribute: "aNormal" },
		];
	}

	static vertecies(geo) {
		return {
			vertecies: [],
			uvs: [],
			normals: [],
		};
	}

	static indecies(geo) {
		return [];
	}

	constructor(args = {}) {
		super(args);

		this.name = "Geometry";

		this.uid = uuidv4();

		this.scale = 1;
		this.uv = [0, 0];

		this.onCreate(args);

		const {
			indecies = null,
			vertecies = null,
			uvs = null,
			normals = null,
			scale = this.scale,
			uv = this.uv,
		} = args;

		const verts = this.constructor.vertecies(this);
		const vertIndecies = this.constructor.indecies(this);

		this.indecies = indecies || vertIndecies;
		this.vertecies = vertecies || verts.vertecies;
		this.uvs = uvs || verts.uvs;
		this.normals = normals || verts.normals;
		this.uv = uv;
		this.scale = scale;
	}

	updateVertexBuffer() {
		this.uid = Date.now() + Math.random();
	}

	onCreate(args) {

	}

	remove() {
		this.removed = true;
	}

	createBuffer() {
		return new VertexBuffer(
			this.vertecies.map((v, i) => {
				const uv = this.uvs[i] || [0, 0];
				const normal = this.normals[i] || [0, 0, 0];

				return [
					v[0],
					v[1],
					v[2],
	
					uv[0],
					uv[1],
	
					normal[0],
					normal[1],
					normal[2]
				];
			}).flat(),
			this.indecies,
			this.constructor.attributes
		);
	}
}

export class VertexBuffer {

	get vertsPerElement() {
		return this.vertecies.length / this.elements;
	}

	get elements() {
		return this.attributeElements;
	}

	constructor(vertArray, indexArray, attributes) {

		this.vertecies = new Float32Array(vertArray);
		this.indecies = new Uint16Array(indexArray);
		
		this.attributes = attributes;

		this.attributeElements = 0;

		for (let key in this.attributes) {
			this.attributeElements += this.attributes[key].size;
		}
	}

}
