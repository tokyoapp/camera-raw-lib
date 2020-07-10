export default {
  name: 'Tint',
  attributes: {
    tint: {
      type: 'float',
      value: 1,
      min: 0,
      max: 2,
    }
  },
  glsl: `
    void Tint(inout vec4 outColor) {
      outColor.r *= tint;
    }
  `
}