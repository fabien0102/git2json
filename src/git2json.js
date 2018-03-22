const parsers = require('./parsers');

// Default fields
// see https://git-scm.com/docs/pretty-formats for placeholder codes
const defaultFields = {
  refs: { value: '%d', parser: parsers.refs },
  hash: { value: '%H' },
  hashAbbrev: { value: '%h' },
  tree: { value: '%T' },
  treeAbbrev: { value: '%t' },
  parents: { value: '%P', parser: parsers.parents },
  parentsAbbrev: { value: '%p', parser: parsers.parents },
  'author.name': { value: '%an' },
  'author.email': { value: '%ae' },
  'author.timestamp': { value: '%at', parser: parsers.timestamp },
  'committer.name': { value: '%cn' },
  'committer.email': { value: '%ce' },
  'committer.timestamp': { value: '%ct', parser: parsers.timestamp },
  subject: { value: '%s' },
  body: { value: '%b' },
  notes: { value: '%N' }
};

/**
 * Execute git log on current folder and return a pretty object
 *
 * @param {object} [options]
 * @param {object} [options.fields] - fields to exports
 * @param {string} [options.path] - path of target git repo
 * @return {Promise}
 */
function git2json({ fields = defaultFields, path = process.cwd() } = {}) {
  // this require can't be global for mocking issue
  const { spawn } = require('child_process');
  const keys = Object.keys(fields);
  const prettyKeys = keys.map(a => fields[a].value).join('%x00');
  const gitLogCmd = `git -C ${path} log --pretty=format:"%x01${prettyKeys}%x01" --numstat --date-order`;
  const [cmd, ...args] = gitLogCmd.split(' ');

  return new Promise((resolve, reject) => {
    let stderr = '';
    let stdout = '';
    const cp = spawn(cmd, args);

    cp.stdout.on('data', data => {
      stdout += data;
    });

    cp.stderr.on('data', data => {
      stderr += data;
    });

    cp.on('error', reject)
      .on('close', code => {
        if (code !== 0) {
          reject(stderr);
        }

        const data = stdout.split('\u0001');
        const stats = data.filter((a, i) => (i + 1) % 2);

        let json = data.filter((a, i) => i % 2).map((raw, k) => {
          return Object.assign(
            raw.split('\u0000').reduce((mem, field, j) => {
              const value = fields[keys[j]].parser
                ? fields[keys[j]].parser(field)
                : field.trim();
              // Deal with nested key format (eg: 'author.name')
              if (/\./.exec(keys[j])) {
                let nameParts = keys[j].split('.');
                mem[nameParts[0]] = Object.assign({}, mem[nameParts[0]], {
                  [nameParts[1]]: value
                });
              } else {
                mem[keys[j]] = value;
              }
              return mem;
            }, {}),
            {
              // Add parsed stats of each commit
              stats: stats[k + 1].split('\n').filter(a => a).map(a => {
                let b = a.split('\t');
                return {
                  additions: isNaN(b[0]) ? null : +b[0],
                  deletions: isNaN(b[1]) ? null : +b[1],
                  file: b[2]
                };
              })
            }
          );
        });
        resolve(json);
    });
  });
}

module.exports = {
  run: git2json,
  defaultFields,
  parsers
};