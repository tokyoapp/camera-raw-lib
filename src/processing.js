export const processingSteps = [
    {
        name: 'Brightness',
        attributes: {
            brightness: {
                type: 'float',
                value: .5,
                min: 0,
                max: 1,
            }
        },
        glsl: `
            void Brightness(inout vec4 outColor) {
                outColor *= 4.0 * brightness;
            }
        `
    }
]