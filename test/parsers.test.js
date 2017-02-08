const parsers = require('../src/parsers');

describe('parsers', () => {
  describe('timestamp', () => {
    it('should parse git timestamp correctly', () => {
      expect(parsers.timestamp('123')).toEqual(123000);
    });
  });

  describe('parents', () => {
    it('should parse parents string as an array', () => {
      expect(parsers.parents(' toto master ')).toEqual(['toto', 'master'])
    });
  });

  describe('refs', () => {
    it('should parse refs as an array', () => {
      expect(parsers.refs('(HEAD -> master, origin/master)')).toEqual(['HEAD', 'master', 'origin/master'])
    });
  });
});