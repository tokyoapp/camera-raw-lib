export default {
  name: 'Tint',
  attributes: {
    tint: {
      type: 'float',
      value: 1,
      min: .5,
      max: 1.5,
    }
  },
  glsl: `
    void Tint(inout vec4 outColor) {
      float l = luminance(outColor.rgb);

      outColor.r /= tint;
      outColor.g /= tint;
      outColor.b *= tint;
    }
  `
}