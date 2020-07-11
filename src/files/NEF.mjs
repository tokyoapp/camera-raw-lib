import DNGFile from "./DNG.mjs";

export default class NEFFile extends DNGFile {
  get type() { return "NEF"; }

  static handleJPEGImage(tags, image) {
    image.type = "jpeg";
  }
}
