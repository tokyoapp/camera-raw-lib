# camera-raw-preview-lib

## Features

- The *option* to use workers for image processing
- Heavy use of WebGL for computing
- Fast image refrash rate
- LUT support
- Expandle image processing attributes/functions
- 8bit - 32bit
- (Video Support (For live preview))

## Camera Raw Lib

### Return data format of ```getImageData()```

```javascript
return {
    orientation: Number, // TIFF orientation tag value
    format: String, // "RGB" or "RGBA"
    bitsPerSample: Number, // 8, 16 or 32
    data: ArrayBuffer, // ArrayBuffer of image data in format above
    width: Number, // width of image in pixels
    height: Number, // height of image in pixels
}
```
