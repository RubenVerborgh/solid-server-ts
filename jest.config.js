module.exports = {
  clearMocks: true,
  globals: {
    "ts-jest": {
      diagnostics: {
        warnOnly: true,
      },
      tsConfig: "tsconfig.json",
    },
  },
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
  ],
  testMatch: [
    "<rootDir>/test/!(__mocks__)/**/*.+(ts|tsx|js)",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
};
