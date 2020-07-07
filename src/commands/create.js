#!/usr/bin/env node
const path = require('path');
const ora = require('ora');
const fs = require('fs-extra');
const download = require('download-git-repo');
const { copyFiles, parseCmdParams, log } = require('../utils');
const { exit } = require('process');
const inquirer = require('inquirer');
const { InquirerConfig } = require('../utils/config');

/**
 * class 项目创建命令
 *
 * @description
 * @param {} source 用户提供的文件夹名称
 * @param {} destination 用户输入的create命令的参数
 */
class Creator {
  constructor(source, destination, ops = {}) {
    this.source = source
    this.cmdParams = parseCmdParams(destination)
    this.RepoMaps = Object.assign({
      repo: 'github:tj/commander.js',
      temp: path.join(__dirname, '../../__temp__'),
      target: this.genTargetPath(this.source)
    }, ops);
    this.spinner = ora('正在拉取项目模板...')
    this.init()
  }

  // 生成目标文件夹的绝对路径
  genTargetPath(relPath = 'vue-ts-template') {
    return path.resolve(process.cwd(), relPath);
  }

  // 初始化函数
  async init() {
    try {
      await this.checkFolderExist();

      this.spinner.start();
      await this.downloadRepo();
      await this.copyRepoFiles();
      this.spinner.succeed('Loading Repo success');
    } catch (error) {
      console.log('')
      log.error(error);
      exit(1)
    } finally {
      this.spinner.stop();
    }
  }

  // 监测文件夹是否存在
  checkFolderExist() {
    return new Promise(async (resolve, reject) => {
      const { target } = this.RepoMaps
      // 如果create附加了--force或-f参数，则直接执行覆盖操作
      if (this.cmdParams.force) {
        await fs.removeSync(target)
        return resolve()
      }
      try {
        // 否则进行文件夹检查
        const isTarget = await fs.pathExistsSync(target)
        if (!isTarget) return resolve()

        const { recover } = await inquirer.prompt(InquirerConfig.folderExist);
        if (recover === 'cover') {
          await fs.removeSync(target);
          return resolve();
        } else if (recover === 'newFolder') {
          const { inputNewName } = await inquirer.prompt(InquirerConfig.rename);
          this.RepoMaps.target = this.genTargetPath(`./${inputNewName}`);
          return resolve();
        } else {
          exit(1);
        }
      } catch (error) {
        log.error(`[vta]Error:${error}`)
        exit(1);
      }
    })
  }

  // 下载repo资源
  downloadRepo() {
    const { repo, temp } = this.RepoMaps
    return new Promise(async (resolve, reject) => {
      await fs.removeSync(temp);
      download(repo, temp, async err => err ? reject(err) : resolve())
    })
  }

  // 拷贝repo资源
  async copyRepoFiles() {
    const { temp, target } = this.RepoMaps
    await copyFiles(temp, target, ['./git', './changelogs']);
  }
}

module.exports = Creator;
