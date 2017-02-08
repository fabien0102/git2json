const child_process = jest.genMockFromModule('child_process');

child_process.__setExecFn = execFn => child_process.exec = execFn;

module.exports = child_process;