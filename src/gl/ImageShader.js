import { Shader } from './RendererShader.js';

export class ImageShader extends Shader {

	static vertexSource() {
		return `#version 300 es

			layout(location = 0) in vec3 aPosition;
			layout(location = 1) in vec2 aTexCoords;

			uniform mat4 modelMatrix;

			out vec2 texCoords;

			void main() {
				gl_Position = vec4(aPosition.xy, 1.0, 1.0) * modelMatrix;
				texCoords = aTexCoords;
			}
		`;
	}

	static fragmentSource() {
		return `#version 300 es

			precision mediump float;
			
			uniform sampler2D imageTexture;

			in vec2 texCoords;

			out vec4 oFragColor;

            void main () {
				vec2 uv = vec2(
					texCoords.x,
					-texCoords.y
				);

				oFragColor = vec4(texture(imageTexture, uv));
				
				oFragColor.r = 1.0;
            }
        `;
	}
}
