export default {
  name: 'Exposure',
  attributes: {
    exposure: {
      type: 'float',
      value: 1,
      min: 0,
      max: 5,
    }
  },
  glsl: `
    void Exposure(inout vec4 outColor) {
      outColor.rgb *= 128.0;
      outColor.rgb *= exposure;
    }
  `
}
