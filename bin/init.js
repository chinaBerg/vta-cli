#!/usr/bin/env node
const package = require('../package');
const { Command } = require('commander');
const { CreateCommand } = require('../src/commands');

const program = new Command();

program
  .version(package.version, '-v, --version', 'display version for vta-cli')
  .usage('<command> [options]');
  // .option('-h, --help', 'display help for command')
  // 添加子命令
  // .command('create [name]')
  // .description('create a template')
  // .action((source, destination) => {
  //   // console.log('source:',source, 'destination:',destination)
  // })

program.command('create <name>')
  .description('create a vta template project')
  .option('-f, --force', '忽略文件夹检查，如果已存在则直接覆盖')
  .action((source, destination) => {
    new CreateCommand(source, destination)
  });

// 切记parse方法的调用，一定要program.parse()方式
// 而不是直接在上面的链式调用之后直接xxx.parse()调用，
// 不然就会作为当前command的parse去处理了，从而help命令等都与你的预期不符合了
try {
  program.parse(process.argv);
} catch (error) {
  console.log('err: ', error)
}