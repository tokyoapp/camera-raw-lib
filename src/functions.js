import { Renderer } from './gl/Renderer.js';

export function testWebGL(canvas) {
    const renderer = new Renderer(canvas);
    renderer.draw();
    return renderer.info;
}
