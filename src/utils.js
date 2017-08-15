let fs = require('fs');
let path = require('path');
let chalk = require('chalk');

class Utils {

  /**
   * 获取某文件夹下的总文件数
   *
   * @param dirPath
   * @returns {number}
   */
  getFilesCount(dirPath) {

    if (!this.isExists(dirPath)) return 0;

    if (fs.statSync(dirPath).isFile()) return 1;

    let count = 0;

    this.travelFolder(dirPath, () => {

      count++;
    });

    return count;
  }

  /**
   * 遍历某文件夹，跳过.git
   *
   * @param dirPath
   * @param callback
   */
  travelFolder(dirPath, callback) {

    fs.readdirSync(dirPath).forEach((item) => {

      var itemPath = path.join(dirPath, item);

      if (fs.statSync(itemPath).isDirectory()) {

        if (item === '.git') {  // 跳过.git
          return;
        }

        this.travelFolder(itemPath, callback);
      } else {

        callback && callback(itemPath);
      }
    });
  }

  /**
   * 复制文件夹，跳过.git
   *
   * @param srcPath
   * @param destinationPath
   */
  copyFolder(srcPath, destinationPath) {

    if (!this.isExists(srcPath)) return;

    let state = fs.statSync(srcPath);

    if (state.isDirectory()) {

      fs.readdirSync(srcPath).forEach((item) => {

        if (item === '.git') {  // 跳过.git
          return;
        }

        let itemPath = path.join(srcPath, item);
        let destPath = path.join(destinationPath, item);

        if (fs.statSync(itemPath).isDirectory()) {

          this.copyFolder(itemPath, destPath);
        } else {

          console.log(chalk.yellow(`create: ${destPath}`));
          this.copyFile(itemPath, destPath);
        }
      });
    } else {

      console.log(chalk.yellow(`create: ${destinationPath}`));
      this.copyFile(srcPath, destinationPath);
    }
  }

  /**
   * 复制文件
   *
   * @param srcPath
   * @param destinationPath
   */
  copyFile(srcPath, destinationPath) {

    let destDirPath = path.dirname(destinationPath);

    if (!this.isExists(destDirPath)) {

      this.createFolder(destDirPath, () => {

        fs.writeFileSync(destinationPath, fs.readFileSync(srcPath));
      });
    } else {

      fs.writeFileSync(destinationPath, fs.readFileSync(srcPath));
    }
  }

  /**
   * 创建文件夹
   *
   * @param dirPath
   * @param callback
   */
  createFolder(dirPath, callback) {

    if (!dirPath) return;

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
   * 创建文件
   *
   * @param filePath
   * @param data
   * @param callback
   */
  writeFile(filePath, data) {

    return new Promise((resolve, reject) => {

      console.log(chalk.yellow(`create: ${filePath}`));

      fs.writeFile(filePath, data, 'utf-8', (err) => {

        if (err) return reject(data);

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
}

module.exports = new Utils();