import { uuidv4 } from './Math.js';

const defaults = {
    wrap_s: "REPEAT",
    wrap_t: "REPEAT",
    mag_filter: "LINEAR",
    min_filter: "LINEAR",
};

function convertToFloatArray(uint8Array) {
    return int16ToFloat32(uint8Array, 0, uint8Array.length);
}

// https://stackoverflow.com/questions/35234551/javascript-converting-from-int16-to-float32
function int16ToFloat32(inputArray, startIndex, length) {
    var output = new Float32Array(inputArray.length-startIndex);
    for (var i = startIndex; i < length; i++) {
        var int = inputArray[i];
        // If the high bit is on, then it is a negative number, and actually counts backwards.
        var float = (int >= 0x8000) ? -(0x10000 - int) / 0x8000 : int / 0x7FFF;
        output[i] = float;
    }
    return output;
}

export class Texture {

    static get PLACEHOLDER() {
        return null;
    }

    get isTexture() {
        return true;
    }

    static get default() {
        return defaults;
    }

    constructor(data, width = 1, height = 1, bitsPerSample = 8, flipY = true) {

        this.uid = uuidv4();

        this.type = "TEXTURE_2D";

        this.wrap_s = Texture.default.wrap_s;
        this.wrap_t = Texture.default.wrap_t;

        this.mag_filter = Texture.default.mag_filter;
        this.min_filter = Texture.default.min_filter;

        this.flipY = flipY;

        this.bitsPerSample = bitsPerSample;
        this.data = data;

        this.width = width;
        this.height = height;

        this.internal_format = "RGB16F";
        this.format = "RGB";
        this.type = "FLOAT";
    }

    getImageData() {
        if(this.bitsPerSample == 8) {
            const data = new Uint8Array(this.data);
            const floatData = convertToFloatArray(data);

            return new Uint8Array(this.data);
        }
        if(this.bitsPerSample == 16) {
            const data = new Uint16Array(this.data);
            const floatData = convertToFloatArray(data);

            return floatData;
        }
        if(this.bitsPerSample == 32) {
            const data = new Uint32Array(this.data);
            const floatData = convertToFloatArray(data);

            return floatData;
        }
    }

}
