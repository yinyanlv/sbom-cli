let fs = require('fs');
let path = require('path');
let chalk = require('chalk');

class Utils {

  /**
   * 创建文件夹
   *
   * @param dirPath
   * @param callback
   */
  createFolder(dirPath, callback) {

    if (!dirPath) return callback && callback();

    fs.exists(dirPath, (isExist) => {

      if (isExist) {

        callback && callback();
      } else {

        this.createFolder(path.dirname(dirPath), () => {

          fs.mkdir(dirPath, callback);
        });
      }
    });
  }

  /**
   * 复制文件夹
   *
   * @param srcPath
   * @param destinationPath
   * @param callback
   */
  copyFolder(srcPath, destinationPath, callback) {

    if (!this.isExists(srcPath)) return callback && callback();

    if (fs.statSync(srcPath).isDirectory()) {

      let items = fs.readdirSync(srcPath);

      if (items.length === 0) {  // 空文件夹

        this.createFolder(destinationPath, () => {

          callback && callback();
        });

        return;
      }

      let createdFileCount = 0;
      let createdDirCount = 0;

      items.forEach((item) => {

        let itemPath = path.join(srcPath, item);
        let destPath = path.join(destinationPath, item);

        if (fs.statSync(itemPath).isDirectory()) {

          this.copyFolder(itemPath, destPath, () => {

            createdDirCount++;

            if (createdFileCount + createdDirCount === items.length) {

              callback && callback();
            }
          });
        } else {

          this.copyFile(itemPath, destPath, () => {

            createdFileCount++;

            if (createdFileCount + createdDirCount === items.length) {

              callback && callback();
            }
          });
        }
      });

    } else {

      this.copyFile(srcPath, destinationPath, callback);
    }
  }

  /**
   * 清空文件夹
   *
   * @param dirPath
   * @param callback
   */
  emptyFolder(dirPath, callback) {

    if (!this.isExists(dirPath)) return callback && callback();

    if (fs.statSync(dirPath).isDirectory()) {

      fs.readdirSync(dirPath).forEach((item) => {
        let itemPath = path.join(dirPath, item);

        this.deleteFolder(itemPath, callback);
      });
    } else {

      this.deleteFile(dirPath);
      callback && callback();
    }
  }

  /**
   * 删除文件夹
   *
   * @param dirPath
   * @param callback
   */
  deleteFolder(dirPath, callback) {

    if (!this.isExists(dirPath)) return callback && callback();

    if (fs.statSync(dirPath).isDirectory()) {

      fs.readdirSync(dirPath).forEach((item) => {
        let itemPath = path.join(dirPath, item);

        if (fs.statSync(itemPath).isDirectory()) {

          this.deleteFolder(itemPath, () => {

            if (this.isExists(dirPath) && !fs.readdirSync(dirPath).length) {  // 当父文件夹为空时，删除父文件夹

              fs.rmdirSync(dirPath);
              this.showYellowInfo(`deleted: ${dirPath}`);
              callback && callback();
            }
          });
        } else {

          this.deleteFile(itemPath);
        }
      });

      if (this.isExists(dirPath) && !fs.readdirSync(dirPath).length) {

        fs.rmdirSync(dirPath);
        this.showYellowInfo(`deleted: ${dirPath}`);
        callback && callback();
      }
    } else {

      this.deleteFile(dirPath);
      callback && callback();
    }
  }

  /**
   * 创建文件
   *
   * @param filePath
   * @param data
   */
  writeFile(filePath, data) {

    return new Promise((resolve, reject) => {

      fs.writeFile(filePath, data, 'utf-8', (err) => {

        if (err) return reject(data);

        this.showYellowInfo(`created: ${filePath}`);

        resolve();
      });
    });
  }

  /**
   * 读取文件
   *
   * @param filePath
   * @returns {Promise}
   */
  readFile(filePath) {

    return new Promise((resolve, reject) => {

      fs.readFile(filePath, 'utf-8', (err, data) => {

        if (err) return reject(err);

        resolve(data);
      });
    });
  }

  /**
   * 复制文件
   *
   * @param srcPath
   * @param destinationPath
   * @param callback
   */
  copyFile(srcPath, destinationPath, callback) {

    let destDirPath = path.dirname(destinationPath);

    if (!this.isExists(destDirPath)) {

      this.createFolder(destDirPath, () => {

        fs.writeFileSync(destinationPath, fs.readFileSync(srcPath));
        this.showYellowInfo(`created: ${destinationPath}`);
        callback && callback();
      });
    } else {

      fs.writeFileSync(destinationPath, fs.readFileSync(srcPath));
      this.showYellowInfo(`created: ${destinationPath}`);
      callback && callback();
    }
  }

  /**
   * 删除文件
   *
   * @param filePath
   * @returns {*}
   */
  deleteFile(filePath) {

    fs.unlinkSync(filePath);
    this.showYellowInfo(`deleted: ${filePath}`);
  }

  /**
   * 判断路径是否存在
   *
   * @param path
   * @returns {boolean}
   */
  isExists(path) {

    if (!path) return false;

    return fs.existsSync(path) ? true : false;
  }

  /**
   * 通用错误提示
   *
   * @param str
   */
  showErrorInfo(str) {

    console.log(chalk.red(`** ERROR INFO **: ${str}`));
  }

  /**
   * 打印红色文字
   *
   * @param str
   */
  showRedInfo(str) {

    console.log(chalk.red(str));
  }

  /**
   * 打印黄色文字
   *
   * @param str
   */
  showYellowInfo(str) {

    console.log(chalk.yellow(str));
  }

  /**
   * 打印绿色文字
   *
   * @param str
   */
  showGreenInfo(str) {

    console.log(chalk.green(str));
  }
}

module.exports = new Utils();