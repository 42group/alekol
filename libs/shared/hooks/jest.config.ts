/* eslint-disable */
export default {
  displayName: 'shared-hooks',
  preset: '../../../jest.preset.js',
  environment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': [
      '@swc/jest',
      { jsc: { transform: { react: { runtime: 'automatic' } } } },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/shared/hooks',
  setupFilesAfterEnv: ['./jest.setup.ts'],
};
