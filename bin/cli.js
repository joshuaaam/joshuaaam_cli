#! /usr/bin/env node
const program = require('commander')
const figlet = require('figlet')
const chalk = require('chalk');



// program
//   // 定义命令和参数
//   .command('create [name]')
//   .description('create a new project')
//   // -f or --force 为强制创建，如果创建的目录存在则直接覆盖
//   .option('-f, --force', 'overwrite target directory if it exist')
//   .action((name, options) => {
//     // 打印结果，输出用户手动输入的项目名字 
//     console.log('name:',name)
//   })
  
program
    // 配置版本号信息
    .version(`v${require('../package.json').version}`)
    .usage('<command> [option]')

program
    .command('create [name]')
    .description('create a new project')
    .option('-f, --force', 'overwrite target directory if it exist') 
    .action((name, options) => {
        require('../lib/create.js')(name, options)    // 引入 create.js 文件
    })

program
    .command('config [value]')
    .description('inspect and modify the config')
    .option('-g, --get <path>', 'get value from option')
    .option('-s, --set <path> <value>')
    .option('-d, --delete <path>', 'delete option from config')
    .action((value, options) => {
        console.log('自定义config 命令：', value);
    }) 
  
program
    .on('--help', () => {
        // 使用 figlet 绘制 Logo
        console.log('\r\n' + figlet.textSync('JARVIS', {
            // font: 'Ghost',
            horizontalLayout: 'default',
            verticalLayout: 'default',
            width: 80,
            whitespaceBreak: true
        }));
        // 新增说明信息
        console.log(`\r\nRun ${chalk.cyan(`jarvis <command> --help`)} show details\r\n`)
       
    })
// 解析用户执行命令传入参数
program.parse(process.argv);