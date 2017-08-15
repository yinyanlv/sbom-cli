let fs = require('fs');
let path = require('path');
let chalk = require('chalk');

class Utils {

  travelFolder(dirPath, callback) {

    fs.readdirSync(dirPath).forEach(function (file) {

      var childPath = path.join(dirPath, file);

      if (fs.statSync(childPath).isDirectory()) {

        this.travelFolder(childPath, callback);
      } else {

        callback && callback(childPath);
      }
    });
  }

  copyFolder(srcPath, destinationPath) {

    if (!this.isExists(srcPath)) return;

    if (fs.statSync(srcPath).isDirectory()) {

      fs.readdirSync(srcPath).forEach(function (item) {
        let itemPath = path.join(srcPath, item);
        let destPath = path.join(destinationPath, item);

        if (fs.statSync(itemPath).isDirectory()) {

          this.copyFolder(itemPath, destPath);
        } else {

          this.copyFile(itemPath, destPath)
        }
      });
    } else {

      this.copyFile(srcPath, destinationPath)
    }
  }

  copyFile(srcPath, destinationPath) {

    fs.createReadStream(srcPath).pipe(fs.createWriteStream(destinationPath));
  }

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

  writeFile(filePath, data, callback) {

    fs.writeFile(filePath, data, 'utf-8', (err) => {

      if (err) console.log(err);

      callback && callback();
    });
  }

  readFile(filePath) {

    return new Promise((resolve, reject) => {

      fs.readFile(filePath, 'utf-8', (err, data) => {

        if (err) {
          reject(err);

          return;
        }

        resolve(data);
      });
    });
  }

  isExists(path) {

    if (!path) return false;

    return fs.existsSync(path) ? true : false;
  }

  showErrorInfo(str) {

    console.log(chalk.red(`** ERROR INFO **: ${str}`));
  }
}

module.exports = new Utils();