export default {
  preset: "ts-jest/presets/js-with-ts-esm",
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  extensionsToTreatAsEsm: [".ts"],
  collectCoverageFrom: ["src/**"],
  transformIgnorePatterns: ["node_modules/(?!(ky))"],
};
