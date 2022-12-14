export default {
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },
  collectCoverageFrom: ["src/**"],
  transformIgnorePatterns: ["node_modules/(?!(ky))"],
};
