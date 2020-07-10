import { parseImageFile } from './files/index.js';
import processingSteps from './processing/index.js';
import { ImageProcessing } from './image/ImageProcessing.js';

export class ImageEngine {

  constructor() {
    this.processing = null;
  }

  async setup(canvas) {
    // non worker option example
    console.info('processing in main thread');

    this.processing = new ImageProcessing(canvas);

    // setup before compile
    for(let step of processingSteps) {
      this.processing.addProcessingStep(step);
    }
  }

  async loadImage(blob) {
    const imageFile = await parseImageFile(blob.url, blob);
    const data = await imageFile.getImageData();
    this.processing.loadImage(data);
  }

  setAttribute(path, value) {
    this.processing.setAttribute(path, value);
  }

}
