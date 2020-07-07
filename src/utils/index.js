const chalk = require('chalk');
const fs = require('fs-extra');

exports.log = {
  warning(msg = '') {
    console.log(chalk.yellow(`${msg}`));
  },
  error(msg = '') {
    console.log(chalk.red(`${msg}`));
  },
  success(msg = '') {
    console.log(chalk.green(`${msg}`));
  }
}

// 拷贝下载的repo资源
exports.copyFiles = async (tempPath, targetPath, excludes = []) => {
  const removeFiles = ['./git', './changelogs']
  // 资源拷贝
  await fs.copySync(tempPath, targetPath)

  // 删除额外的资源文件
  if (excludes && excludes.length) {
    await Promise.all(excludes.map(file => async () =>
      await fs.removeSync(path.resolve(targetPath, file))
    ));
  }
}

const isFunction = (val) => {
  return typeof val === 'function'
}
exports.isFunction = isFunction;

// 解析用户输入的参数
exports.parseCmdParams = (cmd) => {
  if (!cmd) return {}
  const resOps = {}
  cmd.options.forEach(option => {
    const key = option.long.replace(/^--/, '');
    if (cmd[key] && !isFunction(cmd[key])) {
      resOps[key] = cmd[key]
    }
  })
  return resOps
}