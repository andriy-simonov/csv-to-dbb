import type {Config} from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'ts'],
  roots: ['<rootDir>/src/test'],
  testMatch: ['**/test/**/*.ts', '**/?(*-)+test.ts'],
  transform: {'^.+\\.(ts|tsx)$': 'ts-jest'},
  verbose: true,
};
export default config;