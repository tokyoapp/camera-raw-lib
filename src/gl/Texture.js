import { uuidv4 } from './Math.js';

const defaults = {
    wrap_s: "REPEAT",
    wrap_t: "REPEAT",
    mag_filter: "LINEAR",
    min_filter: "LINEAR",
};

export class Texture {

    static get PLACEHOLDER() {
        return null;
    }

    get width() { 
        return this.image ? this.image.width : this.format.width;
    }

    get height() { 
        return this.image ? this.image.height : this.format.height;
    }

    get isTexture() {
        return true;
    }

    static get default() {
        return defaults;
    }

    constructor(image, format = { type: "RAW" }, flipY = true) {

        this.uid = uuidv4();

        this.type = "TEXTURE_2D";

        this.wrap_s = Texture.default.wrap_s;
        this.wrap_t = Texture.default.wrap_t;

        this.mag_filter = Texture.default.mag_filter;
        this.min_filter = Texture.default.min_filter;

        this.flipY = flipY;

        if(image instanceof ArrayBuffer) {
            this.format = format;
            this.data = image;
        } else {
            this.image = image;
        }
    }

}
