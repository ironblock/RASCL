export default {
  testEnvironment: "node",
  preset: "ts-jest/presets/js-with-ts",
  transformIgnorePatterns: ["/node_modules/(?!(ky))"],
  testPathIgnorePatterns: ["/test/stubs/"],
  collectCoverageFrom: ["src/**"],
};
