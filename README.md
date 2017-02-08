# git2json

Simple tool to get a JSON from your git log.

## CLI usage

1. Install package globally -> `npm i -g @fabien0102/git2json` or `yarn global add @fabien0102/git2json`
1. Navigate to your local git repository folder
1. Do `git2json > export.json`
1. Voilà!

## Lib usage

1. Add dependency -> `npm i -s @fabien0102/git2json` or `yarn add @fabien0102/git2json`
1. Use it!

```javascript
const git2json = require('@fabien0102/git2json').run()
  .then(myGitLogJSON => console.log(myGitLogJSON));
```

## Advanced usage

If needed, you have access to `parsers` and `defaultFields` for easy overriding.

Example:

```javascript
const git2json = require('@fabien0102/git2json');
const exportedFields = {
  author: git2json.defaultFields['author.name'],
  commit: git2json.defaultFields.commit,
  shortTree: { value: '%T', parser: a => a.slice(0, 5)}
};

git2json.run({fields: exportedFields})
  .then(json => console.log(json));
```