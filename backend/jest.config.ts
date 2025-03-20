import type { Config } from "@jest/types";

const baseDir = "<rootDir>/src";
const basetestDir = "<rootDir>/test";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [`${baseDir}/**/*.ts`],
  testMatch: [`${basetestDir}/**/*.test.ts`],
};

export default config;
