module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.js'],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/frontend/',
        '/playwright.config.js',
        '\\.e2e\\.js$',
        '\\.spec\\.js$'
    ],
    collectCoverageFrom: ['src/**/*.js'],
};