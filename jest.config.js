/** @type {import('ts-jest').JestConfigWithTsJest} */
// require('dotenv').config({
//   path: '.env.local'
// });
import dotenv from 'dotenv';
dotenv.config({
  path: '.env.local'
});

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // transform: {
  //   '^.+\\.ts?$': 'ts-jest',
  // },
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
};