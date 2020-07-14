export default class RawImageData {
    constructor(objectData) {
        this.orientation = objectData.orientation;
        this.format = objectData.format;
        this.bitsPerSample = objectData.bitsPerSample;
        this.data = objectData.data;
        this.width = objectData.width;
        this.height = objectData.height;
    }
}
