module.exports = {
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"],
    moduleNameMapper: {
      "\\.(css|scss|sass)$": "identity-obj-proxy",
       "\\.(png|jpg|jpeg|gif|webp|svg)$": "<rootDir>/tests/__mocks__/fileMock.ts"
    },
    transform: {
      "^.+\\.(t|j)sx?$": ["babel-jest", { presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"] }]
    }

    
  };
  