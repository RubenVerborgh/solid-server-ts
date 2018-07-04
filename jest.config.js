module.exports = {
  globals: {
    "ts-jest": {
      "tsConfigFile": "tsconfig.json",
      "enableTsDiagnostics": true,
    }
  },
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js"
  ],
  testMatch: [
    "<rootDir>/test/**/*.+(ts|tsx|js)"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
};
