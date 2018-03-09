const git2json = require('../src/git2json').run;
const fs = require('fs');

jest.mock('child_process');

describe('git2json.run', () => {

  it('should parse correctly git log', () => {
    require('child_process').__setExecFn((cmd, callback) => callback(null, fs.readFileSync('test/gitlog.mock', 'utf8')));
    const expected = JSON.parse(fs.readFileSync('test/gitlog.expected', 'utf8'));

    return git2json()
      .then(res => expect(res).toEqual(expected));
  });

  it('should fail on error', () => {
    require('child_process').__setExecFn((cmd, callback) => callback(new Error('any error')));

    return git2json()
      .catch(err => expect(err.message).toEqual('any error'));
  });

  it('should override default fields', () => {
    require('child_process').__setExecFn((cmd, callback) => callback(null, fs.readFileSync('test/gitlog-only-commit.mock', 'utf8')));
    const expected = JSON.parse(fs.readFileSync('test/gitlog-only-commit.expected', 'utf8'));

    return git2json({ fields: { hash: { value: '%H' } } })
      .then(res => expect(res).toEqual(expected));
  });
});