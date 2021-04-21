/*
 * Libraries for storing and editing data
 */

//dependencies
const fs = require('fs');
// this is to normalize paths to the different directories
const path = require('path');

// container for ths module
const lib = {};

// Base directory of data folder
// __dirname will return the current folder
lib.baseDir = path.join(__dirname, '/../.data')

// write data to file
lib.create = function(dir, file, data, callback) {
  // Open the file for writing
  // ws for writing
  fs.open(lib.baseDir + '/' + dir + '/' + file + '.json', 'wx', function(err, fileDescriptor) {

    if (!err && fileDescriptor) {
      // convert data to string
      const stringData = JSON.stringify(data);

      // write to file
      fs.writeFile(fileDescriptor, stringData, function(err) {
        if (!err) {
          fs.close(fileDescriptor, function(err) {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing file');
            }
          });
        } else {
          callback('Error writing to file');
        }
      });
    } else {
      callback('Could not create new file, it may already exist');
    }
  });
};


// read data from a file
lib.read = function(dir, file, callback) {
  fs.readFile(lib.baseDir + '/' + dir + '/' + file + '.json', 'utf8', function(err, data) {
    callback(err, data);
  });
}


// update the file with newdata
lib.update = function(dir, file, data, callback) {
  // Open the file for writing
  // r+ >>
  fs.open(lib.baseDir + '/' + dir + '/' + file + '.json', 'r+', function(err, fileDescriptor) {
    if (!err && fileDescriptor) {

      const stringData = JSON.stringify(data);

      // Truncate the file
      fs.ftruncate(fileDescriptor, function(err) {
        if (!err) {
          // write to the file and close it
          fs.writeFile(fileDescriptor, stringData, function(err) {
            if (!err) {
              fs.close(fileDescriptor, function(err) {
                if (!err) {
                  callback(false);
                } else {
                  callback('Error closing file');
                }
              });
            } else {
              callback('Error writing file');
            }
          });
        } else {
          callback('Error truncating file');
        }
      });
    } else {
      callback('could not open file for updating it may not exist yet');
    }
  });
};

// Delete a file
lib.delete = function(dir, file, callback) {

  // Unlinking the file from file system
  fs.unlink(lib.baseDir + '/' + dir + '/' + file + '.json', function(err) {
    if (!err) {
      callback(false);
    } else {
      callback('Error deleting the file');
    }
  });

};

// Export this module
module.exports = lib;
