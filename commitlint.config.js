module.exports = {
  extends: ["@commitlint/config-conventional"],
  // Dependabot release links can exceed the conventional 100-character body limit.
  rules: { "body-max-line-length": [0] },
};
