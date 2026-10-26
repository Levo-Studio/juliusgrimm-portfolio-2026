// typescript-eslint (loaded by eslint-config-next/typescript) needs the TypeScript compiler
// API, which TypeScript 7.0 does not ship. The TypeScript 7.0 release notes recommend the
// official compatibility package @typescript/typescript6 for such tools. Only the lint
// toolchain gets it: eslint-config-next resolves `typescript` to TypeScript 6 instead of
// the project's TypeScript 7 peer, so `tsc` and `next build` keep using TypeScript 7.
// Remove this file once typescript-eslint supports the TypeScript 7 API.
const TYPESCRIPT_FOR_LINT = 'npm:@typescript/typescript6@6.0.2'

module.exports = {
  hooks: {
    readPackage(pkg) {
      if (pkg.name === 'eslint-config-next' && pkg.peerDependencies?.typescript) {
        delete pkg.peerDependencies.typescript
        pkg.dependencies = { ...pkg.dependencies, typescript: TYPESCRIPT_FOR_LINT }
      }
      return pkg
    },
  },
}
