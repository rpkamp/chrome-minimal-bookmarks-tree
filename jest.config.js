module.exports = {
  "testEnvironment": "jsdom",
  "roots": [
    "<rootDir>/src",
    "<rootDir>/tests",
    "<rootDir>/node_modules/@types"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
};
