const { getRepoList, getTagList } = require("./http");
const ora = require("ora");
const inquirer = require("inquirer");
const chalk = require("chalk");
const path = require("path");
const util = require("util");
const { exec } = require("child_process");
const shell = require("shelljs");
const downloadGitRepo = require("download-git-repo"); // 不支持 Promise
// 添加加载动画

/**
 * 为事件添加loading动画
 * @param {*} fn
 * @param {*} message
 * @param  {...any} args
 */
async function wrapLoading(fn, message, ...args) {
  // 使用 ora 初始化，传入提示信息 message
  const spinner = ora(message);
  // 开始加载动画
  spinner.start();

  try {
    // 执行传入方法 fn
    const result = await fn(...args);
    // 状态为修改为成功Place choose a tag to create project
    spinner.succeed("Request succeed.");
    return result;
  } catch (error) {
    // 状态为修改为失败
    spinner.fail("Request failed, refetch ...", error);
  }
}
class Generator {
  constructor(name, targetDir) {
    // 目录名称
    this.name = name;
    // 创建位置
    this.targetDir = targetDir;
    this.downloadGitRepo = util.promisify(downloadGitRepo);
  }

  /**
   * 获取用户选择的模板
   * 1）从远程拉取模板数据
   * 2）用户选择自己新下载的模板名称
   * 3）return
   */
  async getRepo() {
    // 1）从远程拉取模板数据
    const repoList = await wrapLoading(getRepoList, "waiting fetch template");
    if (!repoList) return;
    // 过滤我们需要的模板名称
    
    const repos = repoList
      .filter(item => item.name.indexOf("template") != -1)
      .map(e => e.name);

    // 2）用户选择自己新下载的模板名称
    const { repo } = await inquirer.prompt({
      name: "repo",
      type: "list",
      choices: repos,
      message: "Please choose a template to create project"
    });

    // 3）return 用户选择的名称
    return repo;
  }

  /**
   * 获取用户选择的版本
   * 1）基于 repo 结果，远程拉取对应的 tag 列表
   * 2）用户选择自己需要下载的 tag
   * 3）return 用户选择的 tag
   * @param {*} repo
   */
  async getTag(repo) {
    // 1）基于 repo 结果，远程拉取对应的 tag 列表
    const tags = await wrapLoading(getTagList, "waiting fetch tag", repo);
    if (!tags) return;

    // 过滤我们需要的 tag 名称
    const tagsList = tags.map(item => item.name);

    // 2）用户选择自己需要下载的 tag
    const { tag } = await inquirer.prompt({
      name: "tag",
      type: "list",
      choices: tagsList,
      message: "Place choose a tag to create project"
    });

    // 3）return 用户选择的 tag
    return tag;
  }

  /**
   * 下载模板
   * 1）拼接下载地址
   * 2）调用下载方法
   * @param {*} repo
   * @param {*} tag
   */
  async download(repo, tag) {
    // 1）拼接下载地址
    // const requestUrl = `vuejs/${repo}${tag?'#'+tag:''}`;

    const requestUrl = `github:joshuaaam/${repo}`;
    // const requestUrl = `https://github.com/joshuaaam/${repo}#master`
    // 2）调用下载方法
    try {
      await wrapLoading(
        this.downloadGitRepo, // 远程下载方法
        "waiting download template", // 加载提示信息
        requestUrl, // 参数1: 下载地址
        path.resolve(process.cwd(), this.targetDir)
      ); // 参数2: 创建位置
      console.log(`\r\n`);
      console.log(
        `✨  Creating project in ${chalk.yellow(process.cwd() + "/" + repo)}.`
      );
      console.log(`🎉  Successfully created project ${chalk.cyan(this.name)}`);

      console.log(`\r\n`);
      console.log(
        `  $  ${chalk.cyan("cd " + this.name)} && ${chalk.cyan("npm install")} `
      );
      console.log(`\r\n`);
    } catch (error) {}
  }

  /**
   * 主方法
   */
  async create() {
    // 1）获取模板名称
    shell.exec(`clear`);
    console.log(
      chalk.greenBright(`  JOSHUA_CLI ` + `v${require("../package.json").version}`)
    );
    const repo = await this.getRepo();

    // 2) 获取 tag 名称
    // const tag = await this.getTag(repo);

    try {
      const { resolve } = require("path");

      const res = this.download(repo);
      // -
      // console.log(`\r\n`)
      // console.log('✨  Creating project in '+ chalk.yellow(process.cwd()) +'.')
      // console.log(`🎉  Successfully created project ${chalk.cyan(this.name)}`)
      // console.log(`\r\n`)
      // console.log(`  $  ${chalk.cyan('cd '+ this.name)} && ${chalk.cyan('npm install')} `)
      // console.log(`\r\n`)
      // -

    } catch (error) {
      console.log(`\r\ Please check the network and try again `);
    }
  }
}
module.exports = Generator;
