const git2json = require('../src/git2json').run;
const mockSpawn = require('mock-spawn');
const fs = require('fs');

jest.mock('child_process', () => ({spawn: mockSpawn()}));
const child_process = require('child_process');

describe('git2json.run', () => {

  it('should parse correctly git log', () => {
    child_process.spawn.setDefault(
      child_process.spawn.simple(0, fs.readFileSync('test/gitlog.mock', 'utf8'))
    );
    const expected = JSON.parse(fs.readFileSync('test/gitlog.expected', 'utf8'));

    return git2json()
      .then(res => expect(res).toEqual(expected));
  });

  it('should fail on error', () => {
    child_process.spawn.setDefault(function (cb) {
      this.emit('error', new Error('any error'));
      cb(1);
    });

    return git2json()
      .catch(err => expect(err.message).toEqual('any error'));
  });

  it('should override default fields', () => {
    child_process.spawn.setDefault(
      child_process.spawn.simple(0, fs.readFileSync('test/gitlog-only-commit.mock', 'utf8'))
    );
    const expected = JSON.parse(fs.readFileSync('test/gitlog-only-commit.expected', 'utf8'));

    return git2json({ fields: { hash: { value: '%H' } } })
      .then(res => expect(res).toEqual(expected));
  });

  it('should parse \'-\' character for stats correctly', () => {
    child_process.spawn.setDefault(
      child_process.spawn.simple(0, fs.readFileSync('test/gitlog-NaN-stats.mock', 'utf8'))
    );
    const expected = JSON.parse(fs.readFileSync('test/gitlog-NaN-stats.expected', 'utf8'));

    return git2json()
      .then(res => expect(res).toEqual(expected));
  });



});