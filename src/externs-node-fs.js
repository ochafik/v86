/*
* Copyright 2012 The Closure Compiler Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/**
 * @fileoverview Definitions for node's fs module. Depends on the stream and events module.
 * @see http://nodejs.org/api/fs.html
 * @see https://github.com/joyent/node/blob/master/lib/fs.js
 * @see https://github.com/dcodeIO/node.js-closure-compiler-externs/blob/master/fs.js
 * @externs
 * @author Daniel Wirtz <dcode@dcode.io>
 */

//https://github.com/google/closure-compiler/wiki/Types-in-the-Closure-Type-System

/**
 BEGIN_NODE_INCLUDE
 var fs = require('fs');
 END_NODE_INCLUDE
 */

// /**
//  * @typedef {
//  * {
//  *  rename: function(string, string, function(...)=): void,
//  *  renameSync: function(string, string): void
//  * }}
//  * @export
//  */
// var node_fs;

/** @constructor */
function fs() {}

 /** @constructor */

 /**
  * @param {string} oldPath
  * @param {string} newPath
  * @param {function(...)=} callback
  */
 fs.prototype.rename = function(oldPath, newPath, callback) {};
 
 /**
  * @param {string} oldPath
  * @param {string} newPath
  */
 fs.prototype.renameSync = function(oldPath, newPath) {};
 
 /**
  * @param {*} fd
  * @param {number} len
  * @param {function(...)=} callback
  */
 fs.prototype.truncate = function(fd, len, callback) {};
 
 /**
  * @param {*} fd
  * @param {number} len
  */
 fs.prototype.truncateSync = function(fd, len) {};
 
 /**
  * @param {string} path
  * @param {number=} mode
  * @param {function(...)=} callback
  */
 fs.prototype.access = function(path, mode, callback) {};
 
 /**
  * @param {string} path
  * @param {number=} mode
  */
 fs.prototype.accessSync = function(path, mode) {};
 
 /**
  * @param {string} path
  * @param {number} uid
  * @param {number} gid
  * @param {function(...)=} callback
  */
 fs.prototype.chown = function(path, uid, gid, callback) {};
 
 /**
  * @param {string} path
  * @param {number} uid
  * @param {number} gid
  */
 fs.prototype.chownSync = function(path, uid, gid) {};
 
 /**
  * @param {*} fd
  * @param {number} uid
  * @param {number} gid
  * @param {function(...)=} callback
  */
 fs.prototype.fchown = function(fd, uid, gid, callback) {};
 
 /**
  * @param {*} fd
  * @param {number} uid
  * @param {number} gid
  */
 fs.prototype.fchownSync = function(fd, uid, gid) {};
 
 /**
  * @param {string} path
  * @param {number} uid
  * @param {number} gid
  * @param {function(...)=} callback
  */
 fs.prototype.lchown = function(path, uid, gid, callback) {};
 
 /**
  * @param {string} path
  * @param {number} uid
  * @param {number} gid
  */
 fs.prototype.lchownSync = function(path, uid, gid) {};
 
 /**
  * @param {string} path
  * @param {number} mode
  * @param {function(...)=} callback
  */
 fs.prototype.chmod = function(path, mode, callback) {};
 
 /**
  * @param {string} path
  * @param {number} mode
  */
 fs.prototype.chmodSync = function(path, mode) {};
 
 /**
  * @param {*} fd
  * @param {number} mode
  * @param {function(...)=} callback
  */
 fs.prototype.fchmod = function(fd, mode, callback) {};
 
 /**
  * @param {*} fd
  * @param {number} mode
  */
 fs.prototype.fchmodSync = function(fd, mode) {};
 
 /**
  * @param {string} path
  * @param {number} mode
  * @param {function(...)=} callback
  */
 fs.prototype.lchmod = function(path, mode, callback) {};
 
 /**
  * @param {string} path
  * @param {number} mode
  */
 fs.prototype.lchmodSync = function(path, mode) {};
 
 /**
  * @param {string} path
  * @param {function(string, fs.Stats)=} callback
  */
 fs.prototype.stat = function(path, callback) {};
 
 /**
  * @param {string} path
  * @return {fs.Stats}
  * @nosideeffects
  */
 fs.prototype.statSync = function(path) {}
 
 /**
  * @param {*} fd
  * @param {function(string, fs.Stats)=} callback
  */
 fs.prototype.fstat = function(fd, callback) {};
 
 /**
  * @param {*} fd
  * @return {fs.Stats}
  * @nosideeffects
  */
 fs.prototype.fstatSync = function(fd) {}
 
 /**
  * @param {string} path
  * @param {function(string, fs.Stats)=} callback
  */
 fs.prototype.lstat = function(path, callback) {};
 
 /**
  * @param {string} path
  * @return {fs.Stats}
  * @nosideeffects
  */
 fs.prototype.lstatSync = function(path) {}
 
 /**
  * @param {string} srcpath
  * @param {string} dstpath
  * @param {function(...)=} callback
  */
 fs.prototype.link = function(srcpath, dstpath, callback) {};
 
 /**
  * @param {string} srcpath
  * @param {string} dstpath
  */
 fs.prototype.linkSync = function(srcpath, dstpath) {};
 
 /**
  * @param {string} srcpath
  * @param {string} dstpath
  * @param {string=} type
  * @param {function(...)=} callback
  */
 fs.prototype.symlink = function(srcpath, dstpath, type, callback) {};
 
 /**
  * @param {string} srcpath
  * @param {string} dstpath
  * @param {string=} type
  */
 fs.prototype.symlinkSync = function(srcpath, dstpath, type) {};
 
 /**
  * @param {string} path
  * @param {function(string, string)=} callback
  */
 fs.prototype.readlink = function(path, callback) {};
 
 /**
  * @param {string} path
  * @return {string}
  * @nosideeffects
  */
 fs.prototype.readlinkSync = function(path) {};
 
 /**
  * @param {string} path
  * @param {Object.<string,string>|function(string, string)=} cache
  * @param {function(string, string)=} callback
  */
 fs.prototype.realpath = function(path, cache, callback) {};
 
 /**
  * @param {string} path
  * @param {Object.<string,string>=} cache
  * @return {string}
  * @nosideeffects
  */
 fs.prototype.realpathSync = function(path, cache) {};
 
 /**
  * @param {string} path
  * @param {function(...)=} callback
  */
 fs.prototype.unlink = function(path, callback) {};
 
 /**
  * @param {string} path
  */
 fs.prototype.unlinkSync = function(path) {};
 
 /**
  * @param {string} path
  * @param {function(...)=} callback
  */
 fs.prototype.rmdir = function(path, callback) {};
 
 /**
  * @param {string} path
  */
 fs.prototype.rmdirSync = function(path) {};
 
 /**
  * @param {string} path
  * @param {number=} mode
  * @param {function(...)=} callback
  */
 fs.prototype.mkdir = function(path, mode, callback) {};
 
 /**
  * @param {string} path
  * @param {number=} mode
  */
 fs.prototype.mkdirSync = function(path, mode) {};
 
 /**
  * @param {string} path
  * @param {function(string,Array.<string>)=} callback
  */
 fs.prototype.readdir = function(path, callback) {};
 
 /**
  * @param {string} path
  * @return {Array.<string>}
  * @nosideeffects
  */
 fs.prototype.readdirSync = function(path) {};
 
 /**
  * @param {*} fd
  * @param {function(...)=} callback
  */
 fs.prototype.close = function(fd, callback) {};
 
 /**
  * @param {*} fd
  */
 fs.prototype.closeSync = function(fd) {};
 
//  /**
//   * @param {string} path
//   * @param {string} flags
//   * @param {number=} mode
//   * @param {function(string, *)=} callback
//   */
//   fs.prototype.open = function(path, flags, mode, callback) {};
 
 /**
  * @param {string} path
  * @param {string} flags
  * @param {function(string, *)=} callback
  */
  fs.prototype.open = function(path, flags, callback) {};
 
 /**
  * @param {string} path
  * @param {string} flags
  * @param {number=} mode
  * @return {*}
  * @nosideeffects
  */
 fs.prototype.openSync = function(path, flags, mode) {};
 
 /**
  * @param {string} path
  * @param {number|Date} atime
  * @param {number|Date} mtime
  * @param {function(...)=} callback
  */
 fs.prototype.utimes = function(path, atime, mtime, callback) {};
 
 /**
  * @param {string} path
  * @param {number|Date} atime
  * @param {number|Date} mtime
  * @nosideeffects
  */
 fs.prototype.utimesSync = function(path, atime, mtime) {};
 
 /**
  * @param {*} fd
  * @param {number|Date} atime
  * @param {number|Date} mtime
  * @param {function(...)=} callback
  */
 fs.prototype.futimes = function(fd, atime, mtime, callback) {};
 
 /**
  * @param {*} fd
  * @param {number|Date} atime
  * @param {number|Date} mtime
  * @nosideeffects
  */
 fs.prototype.futimesSync = function(fd, atime, mtime) {};
 
 /**
  * @param {*} fd
  * @param {function(...)=} callback
  */
 fs.prototype.fsync = function(fd, callback) {};
 
 /**
  * @param {*} fd
  */
 fs.prototype.fsyncSync = function(fd) {};
 
 /**
  * @param {*} fd
  * @param {*} buffer
  * @param {number} offset
  * @param {number} length
  * @param {number} position
  * @param {function(string, number, *)=} callback
  */
 fs.prototype.write = function(fd, buffer, offset, length, position, callback) {};
 
 /**
  * @param {*} fd
  * @param {*} buffer
  * @param {number} offset
  * @param {number} length
  * @param {number} position
  * @return {number}
  */
 fs.prototype.writeSync = function(fd, buffer, offset, length, position) {};
 
 /**
  * @param {*} fd
  * @param {*} buffer
  * @param {number} offset
  * @param {number} length
  * @param {number} position
  * @param {function(string, number, *)=} callback
  */
 fs.prototype.read = function(fd, buffer, offset, length, position, callback) {};
 
 /**
  * @param {*} fd
  * @param {*} buffer
  * @param {number} offset
  * @param {number} length
  * @param {number} position
  * @return {number}
  * @nosideeffects
  */
 fs.prototype.readSync = function(fd, buffer, offset, length, position) {};
 
 /**
  * @param {string} filename
  * @param {string|{encoding:(string|undefined),flag:(string|undefined)}|function(string, (string|ArrayBuffer))=} encodingOrOptions
  * @param {function(string, (string|ArrayBuffer))=} callback
  */
 fs.prototype.readFile = function(filename, encodingOrOptions, callback) {};
 
 /**
  * @param {string} filename
  * @param {string|{encoding:(string|undefined),flag:(string|undefined)}=} encodingOrOptions
  * @return {string|ArrayBuffer}
  * @nosideeffects
  */
 fs.prototype.readFileSync = function(filename, encodingOrOptions) {};
 
 /**
  * @param {string} filename
  * @param {*} data
  * @param {string|{encoding:(string|undefined),mode:(number|undefined),flag:(string|undefined)}|function(string)=} encodingOrOptions
  * @param {function(string)=} callback
  */
 fs.prototype.writeFile = function(filename, data, encodingOrOptions, callback) {};
 
 /**
  * @param {string} filename
  * @param {*} data
  * @param {string|{encoding:(string|undefined),mode:(number|undefined),flag:(string|undefined)}|function(string)=} encodingOrOptions
  */
 fs.prototype.writeFileSync = function(filename, data, encodingOrOptions) {};
 
 /**
  * @param {string} src
  * @param {string} dest
  * @param {number|function(...)=} flags
  * @param {function(...)=} callback
  */
 fs.prototype.copyFile = function(src, dest, flags, callback) {};
 
 /**
  * @param {string} src
  * @param {string} dest
  * @param {number=} flags
  */
 fs.prototype.copyFileSync = function(src, dest, flags) {};
 
 /**
  * @param {string} filename
  * @param {*} data
  * @param {string|function(string)=} encoding
  * @param {function(string)=} callback
  */
 fs.prototype.appendFile = function(filename, data, encoding, callback) {};
 
 /**
  * @param {string} filename
  * @param {*} data
  * @param {string|function(string)=} encoding
  */
 fs.prototype.appendFileSync = function(filename, data, encoding) {};
 
 /**
  * @param {string} filename
  * @param {{persistent: boolean, interval: number}|function(*,*)=} options
  * @param {function(*,*)=} listener
  */
 fs.prototype.watchFile = function(filename, options, listener) {};
 
 /**
  * @param {string} filename
  * @param {function(string, string)=} listener
  */
 fs.prototype.unwatchFile = function(filename, listener) {};
 
 /**
  *
  * @param {string} filename
  * @param {{persistent: boolean}|function(string, string)=} options
  * @param {function(string, string)=} listener
  * @return {fs.FSWatcher}
  */
 fs.prototype.watch = function(filename, options, listener) {};
 
 /**
  * @param {string} path
  * @param {function(boolean)} callback
  */
 fs.prototype.exists = function(path, callback) {};
 
 /**
  * @param {string} path
  * @nosideeffects
  */
 fs.prototype.existsSync = function(path) {};
 
 /**
  * @constructor
  */
 fs.Stats = function() {};
 
 /**
  * @return {boolean}
  * @nosideeffects
  */
 fs.Stats.prototype.isFile = function() {};
 
 /**
  * @return {boolean}
  * @nosideeffects
  */
 fs.Stats.prototype.isDirectory = function() {};
 
 /**
  * @return {boolean}
  * @nosideeffects
  */
 fs.Stats.prototype.isBlockDevice = function() {};
 
 /**
  * @return {boolean}
  * @nosideeffects
  */
 fs.Stats.prototype.isCharacterDevice = function() {};
 
 /**
  * @return {boolean}
  * @nosideeffects
  */
 fs.Stats.prototype.isSymbolicLink = function() {};
 
 /**
  * @return {boolean}
  * @nosideeffects
  */
 fs.Stats.prototype.isFIFO = function() {};
 
 /**
  * @return {boolean}
  * @nosideeffects
  */
 fs.Stats.prototype.isSocket = function() {};
 
 /**
  * @type {number}
  */
 fs.Stats.prototype.dev = 0;
 
 /**
  * @type {number}
  */
 fs.Stats.prototype.ino = 0;
 
 /**
  * @type {number}
  */
 fs.Stats.prototype.mode = 0;
 
 /**
  * @type {number}
  */
 fs.Stats.prototype.nlink = 0;
 
 /**
  * @type {number}
  */
 fs.Stats.prototype.uid = 0;
 
 /**
  * @type {number}
  */
 fs.Stats.prototype.gid = 0;
 
 /**
  * @type {number}
  */
 fs.Stats.prototype.rdev = 0;
 
 /**
  * @type {number}
  */
 fs.Stats.prototype.size = 0;
 
 /**
  * @type {number}
  */
 fs.Stats.prototype.blkSize = 0;
 
 /**
  * @type {number}
  */
 fs.Stats.prototype.blocks = 0;
 
 /**
  * @type {Date}
  */
 fs.Stats.prototype.atime;
 
 /**
  * @type {Date}
  */
 fs.Stats.prototype.mtime;
 
 /**
  * @type {Date}
  */
 fs.Stats.prototype.ctime;
 
 /**
  * @param {string} path
  * @param {{flags: string, encoding: ?string, fd: *, mode: number, bufferSize: number}=} options
  * @return {fs.ReadStream}
  * @nosideeffects
  */
 fs.createReadStream = function(path, options) {};
 
 /**
  * @constructor
  * @extends ReadableStream
  */
 fs.ReadStream = function() {};
 
 /**
  * @param {string} path
  * @param {{flags: string, encoding: ?string, mode: number}=} options
  * @return {fs.WriteStream}
  * @nosideeffects
  */
 fs.createWriteStream = function(path, options) {};
 
 /**
  * @constructor
  * @extends WritableStream
  */
 fs.WriteStream = function() {};
 
 /**
  * @constructor
  */
//  * @extends EventEmitter
 fs.FSWatcher = function() {};
 
 /**
  */
 fs.FSWatcher.prototype.close = function() {};
