const git2json = require('../src/git2json').run;
const mockSpawn = require('mock-spawn');
const actualSpawn = require.requireActual('child_process').spawn
const fs = require('fs');

const CLI_PATH = require.resolve('../bin/git2json');

describe('git2json.run', () => {
  jest.mock('child_process', () => ({spawn: mockSpawn()}));
  const child_process = require('child_process');

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

  it('should handle and combine multiple target repository paths', () => {
    child_process.spawn.sequence.add(child_process.spawn.simple(0, fs.readFileSync('test/gitlog-multi-one.mock', 'utf8')));
    child_process.spawn.sequence.add(child_process.spawn.simple(0, fs.readFileSync('test/gitlog-multi-two.mock', 'utf8')));

    const expected = JSON.parse(fs.readFileSync('test/gitlog-multi.expected', 'utf8'));

    return git2json({paths: ['/mock/path/one', '/mock/path/two'] })
      .then(res => expect(res).toEqual(expected));
  });
});


describe('git2json cli', () => {
  it('passing --help should print help', () => {
    return runGit2jsonCli(['--help']).then(stdout => {
      expect(stdout).toMatchSnapshot()
    })
  })

  it('passing --h should print help', () => {
    return runGit2jsonCli(['--h']).then(stdout => {
      expect(stdout).toMatchSnapshot()
    })
  })

  it('passing --version should print version', () => {
    return runGit2jsonCli(['--version']).then(stdout => {
      expect(stdout).toMatchSnapshot()
    })
  })
});

function runGit2jsonCli(args = []) {
  return new Promise((resolve, reject) => {
    let stdout = ''
    let stderr = ''
    const child = actualSpawn('node', [CLI_PATH, ...args])

    child.on('error', error => {
      reject(error)
    })

    child.stdout.on('data', data => {
      stdout += data.toString()
    })

    child.stderr.on('data', data => {
      stderr += data.toString()
    })

    child.on('close', () => {
      if (stderr) {
        reject(stderr)
      } else {
        resolve(stdout)
      }
    })
  })
}