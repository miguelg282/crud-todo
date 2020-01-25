const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {

  counter.getNextUniqueId((err, id) => {
    //create path
    var textFilePath = path.join(exports.dataDir, id + '.txt');
    // writeFile with 3 parameters(path, message, callback)
    fs.writeFile(textFilePath, text, (err) => {
      if (err) {
        callback(err); // you want client to know the error
      } else {
        //callback with object with id & text
        callback(null, { id, text });
      }
    });
  });
  //id is the current value of id.
  // create a new file path inside dataDir using this new id

  // when post request is made to collection route, save a file with todo item in this folder
  // only save todo text in the file
  //create variable file path concatinating path and unique id.

};

exports.readAll = (callback) => {
  // returning an array of todos to client app whenever a GET request to the collection route occurs.
  // To do this, you will need to read the dataDir directory and build a list of files. Remember, the id of each todo item is encoded in its filename.
  // VERY IMPORTANT: at this point in the basic requirements, do not attempt to read the contents of each file that contains the todo item text.
  // Please note, however, you must still include a text field in your response to the client, and it's recommended that you use the message's id (that you identified from the filename) for both the id field and the text field. Doing so will have the effect of changing the presentation of your todo items for the time being

  // for each file in data, we want the file name as id in our object, and the content inside as text.
  // promisify readOne, go over each file in data, and read each file (use promise.all)
  var readOneAsync = Promise.promisify(exports.readOne);

  fs.readdir(exports.dataDir, (err, items) => {
    if (err) {
      callback(err);
    } else {
      var data = _.map(items, (file) => { // success will still send an empty array if there's nothing
        var id = path.basename(file, '.txt'); // chops out .txt
        // var textStr = text.substring(0, 5);
        return readOneAsync(id);
      });
      Promise.all(data)
        .then(function (values) {
          // console.log('+++++++', values);
          callback(null, values);
        });
    }
  });
};


exports.readOne = (id, callback) => {
  var textFilePath = path.join(exports.dataDir, id + '.txt');
  fs.readFile(textFilePath, 'utf8', (err, text) => {
    if (err) {
      callback(new Error('File does not exist'));
    } else {
      callback(null, { id, text });
    }
  });
  // var text = items[id]; // this won't work
  // if (!text) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {

  //   callback(null, { id, text });
  // }
};

exports.update = (id, text, callback) => {
  var textFilePath = path.join(exports.dataDir, id + '.txt');
  fs.readFile(textFilePath, (err, data) => {
    if (err) {
      callback(new Error('File does not exist'));
    } else {
      fs.writeFile(textFilePath, text, (err) => {
        if (err) {
          callback(new Error('File does not exist'));
        } else {
          // items[id] = text;
          callback(null, { id, text });
        }
      });
    }
  });
  // var item = items[id];
  // if (!item) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   items[id] = text;
  //   callback(null, { id, text });
  // }
};

exports.delete = (id, callback) => {
  var textFilePath = path.join(exports.dataDir, id + '.txt');
  fs.unlink(textFilePath, (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback();
    }
  });
  // var item = items[id];
  // delete items[id];
  // if (!item) {
  //   // report an error if item not found
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   callback();
  // }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};