// helpers/files-repo.js
const { exec } = require("child_process");

export const support = {
  runCommand: (command) => {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(`Error: ${error.message}`);
        }
        if (stderr) {
          reject(`Stderr: ${stderr}`);
        }
        resolve(stdout);
      });
    });
  },
};
