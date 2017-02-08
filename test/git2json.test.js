const git2json = require('../src/git2json').git2json;
const fs = require('fs');

describe('git2json', () => {
  let execStub;

  it('should parse correctly git log', () => {
    execStub = (cmd, callback) => callback(null, fs.readFileSync('test/gitlog.mock', 'utf8'));
    const expected = JSON.parse(fs.readFileSync('test/gitlog.expected', 'utf8'));

    return git2json({ exec: execStub })
      .then(res => expect(res).toEqual(expected));
  });

  it('should fail on error', () => {
    execStub = (cmd, callback) => callback(new Error('any error'));

    return git2json({ exec: execStub })
      .catch(err => expect(err.message).toEqual('any error'));
  });

  it('should override default fields', () => {
    execStub = (cmd, callback) => callback(null, fs.readFileSync('test/gitlog-only-commit.mock', 'utf8'));
    const expected = JSON.parse(fs.readFileSync('test/gitlog-only-commit.expected', 'utf8'));

    return git2json({ exec: execStub, fields: { commit: { value: '%H' } } })
      .then(res => expect(res).toEqual(expected));
  });
});