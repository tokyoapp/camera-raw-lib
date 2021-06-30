import { BinaryFile } from "../lib/binary-file-lib/files/BinaryFile";

export default class PNGFile extends BinaryFile {

    static parseFile(file) {
        // read file header
        
    }

    async getThumbnail() {
        return new Blob([this.buffer], { type: "image/png" });
    }

}
