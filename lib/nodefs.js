// -------------------------------------------------
// ----------------- FILESYSTEM---------------------
// -------------------------------------------------
// Implementation of a unix filesystem in memory.

"use strict";

function join(a, b) {
  let out = a;
  if (!a.endsWith('/') && !b.startsWith('/')) out += '/';
  out += b;
  return out;
}

function basename(path) {
  const i = path.lastIndexOf('/');
  const parent = path.substring(0, i);
  return parent == '' ? null : parent;
}

/**
 * @constructor
 * @param {!fs} fs
 * @param {{ last_qidnumber: number }=} qidcounter Another fs's qidcounter to synchronise with.
 * @implements {FS}
 * @export
 */
function NodeFS(fs, qidcounter) {
    /** @type {!Object.<number, !string>} inodeid -> full path in fs */
    this.paths = {};
    /** @type {!Object.<number, number>} inodeid -> qidnumber */
    this.qidnumbers = {};
    /** @type {!Object.<!string, number>} full path -> inodeid */
    this.ids = {};
    this.events = [];
    /** @type {!Object.<number, !Inode>} */
    this.inodes = {};
    /** @type {!Object.<number, !Uint8Array>} */
    this.inodedata = {};

    this.nextinodeid = 1;

    this.qidcounter = qidcounter || { last_qidnumber: 0 };
    this.fs = fs;
    // /** @type {!Object.<number, !{fd: number, exclusive: boolean}>} inodeid -> file descriptor */
    // this.fds = {};

    this.total_size = 256 * 1024 * 1024 * 1024;
    this.used_size = 0;
}

NodeFS.prototype.get_state = function() {
    console.log('NodeFS.prototype.get_state');
    return [this.paths];
};

NodeFS.prototype.set_state = function(state) {
    console.log('NodeFS.prototype.set_state');
  this.paths = state[0] || {};
  this.ids = {};
  for (const id in this.paths) {
      const path = this.GetFullPath(Number(id));
      this.ids[path] = id;
  }
};


// -----------------------------------------------------

NodeFS.prototype.AddEvent = function(id, OnEvent) {
    console.log('NodeFS.prototype.AddEvent');
  OnEvent();
  // throw 'TODO: NodeFS.prototype.AddEvent';
    // var inode = this.inodes[id];
    // if (inode.status == STATUS_OK || inode.status == STATUS_ON_STORAGE) {
    //     OnEvent();
    // }
    // else
    // {
    //     this.events.push({id: id, OnEvent: OnEvent});
    // }
};

NodeFS.prototype.HandleEvent = function(id) {
    console.log('NodeFS.prototype.HandleEvent');
  throw 'TODO: NodeFS.prototype.HandleEvent';
    // const inode = this.inodes[id];
    // //message.Debug("number of events: " + this.events.length);
    // var newevents = [];
    // for(var i=0; i<this.events.length; i++) {
    //     if (this.events[i].id == id) {
    //         this.events[i].OnEvent();
    //     } else {
    //         newevents.push(this.events[i]);
    //     }
    // }
    // this.events = newevents;
};

NodeFS.prototype.load_from_json = function(fs, done) {
    console.log('NodeFS.prototype.load_from_json');
    throw 'Unsupported operation'
};

// -----------------------------------------------------

// Note: parentid = -1 for initial root directory.
NodeFS.prototype.CreateDirectory = function(name, parentid) {
    console.log('NodeFS.prototype.CreateDirectory');
    let mode = 0x01FF | S_IFDIR;
    let parent = '/';
    if (parentid >= 0) {
      parent = this.GetFullPath(parentid);
      const parentstat = this.TryStat(parent);
      mode = (parentstat.mode & 0x1FF) | S_IFDIR;
    }
    const fullpath = join(parent, name);
    this.fs.mkdirSync(fullpath, mode);
    const inodeid = this.GetInodeId(fullpath);
    this.NotifyListeners(inodeid, 'newdir');
    return inodeid;
};

NodeFS.prototype.CreateFile = function(filename, parentid) {
    console.log('NodeFS.prototype.CreateFile');
  const path = this.GetChildFullPath(parentid, filename);
  this.withOpenSync(path, 'w', fd => {});
  const id = this.GetInodeId(path);
  this.NotifyListeners(id, 'newfile');
  return this.GetInodeId(path);
};


NodeFS.prototype.CreateNode = function(filename, parentid, major, minor) {
    console.log('NodeFS.prototype.CreateNode');
  const path = this.GetChildFullPath(parentid, filename);
  return this.GetInodeId(path);
    // const parent_inode = this.inodes[parentid];
    // var x = this.CreateInode();
    // x.major = major;
    // x.minor = minor;
    // x.uid = this.inodes[parentid].uid;
    // x.gid = this.inodes[parentid].gid;
    // x.qid.type = S_IFSOCK >> 8;
    // x.mode = (this.inodes[parentid].mode & 0x1B6);
    // this.PushInode(x, parentid, filename);
    // return this.inodes.length-1;
};

NodeFS.prototype.CreateSymlink = function(filename, parentid, symlink) {
    console.log('NodeFS.prototype.CreateSymlink');
  const path = this.GetChildFullPath(parentid, filename);
  this.fs.symlinkSync(symlink, path);
  return this.GetInodeId(path);
};

NodeFS.prototype.CreateTextFile = async function(filename, parentid, str) {
    console.log('NodeFS.prototype.CreateTextFile');
    var data = new Uint8Array(str.length);
    for (var j = 0; j < str.length; j++) {
        data[j] = str.charCodeAt(j);
    }
    return this.CreateBinaryFile(filename, parentid, data);
};

/**
 * @param {Uint8Array} buffer
 */
NodeFS.prototype.CreateBinaryFile = async function(filename, parentid, buffer) {
    console.log('NodeFS.prototype.CreateBinaryFile');
    const path = this.GetChildFullPath(parentid, filename);
    await new Promise((res, rej) => this.fs.writeFile(path, buffer, err => {
      if (err) rej(err);
      else res();
    }));
    return this.GetInodeId(path);
};

NodeFS.prototype.RoundToDirentry = function(dirid, offset_target) {
    console.log('NodeFS.prototype.RoundToDirentry');
    const data = this.inodedata[dirid];
    dbg_assert(data, `FS directory data for dirid=${dirid} should be generated`);
    dbg_assert(data.length, "FS directory should have at least an entry");

    if(offset_target >= data.length)
    {
        return data.length;
    }

    let offset = 0;
    while(true)
    {
        const next_offset = marshall.Unmarshall(["Q", "d"], data, { offset })[1];
        if(next_offset > offset_target) break;
        offset = next_offset;
    }

    return offset;
};

NodeFS.prototype.OpenInode = function(id, mode) {
    console.log('NodeFS.prototype.OpenInode');

    const inode = this.GetInode(id);
    if ((inode.mode&S_IFMT) == S_IFDIR) {
      this.inodedata[id] = inode.getDirectoryData(this);
    }
    
    /*
    var type = "";
    switch(inode.mode&S_IFMT) {
        case S_IFREG: type = "File"; break;
        case S_IFBLK: type = "Block Device"; break;
        case S_IFDIR: type = "Directory"; break;
        case S_IFCHR: type = "Character Device"; break;
    }
    */
    //message.Debug("open:" + this.GetFullPath(id) +  " type: " + inode.mode + " status:" + inode.status);
    return true;
};

NodeFS.prototype.CloseInode = async function(id) {
    console.log('NodeFS.prototype.CloseInode');
    delete this.inodedata[id];
  // throw 'TODO: NodeFS.prototype.CloseInode (nothing to do really?)';
    // //message.Debug("close: " + this.GetFullPath(id));
    // var inode = this.inodes[id];
    // if(inode.status === STATUS_ON_STORAGE)
    // {
    //     this.storage.uncache(inode.sha256sum);
    // }
    // if (inode.status == STATUS_UNLINKED) {
    //     //message.Debug("Filesystem: Delete unlinked file");
    //     inode.status = STATUS_INVALID;
    //     await this.DeleteData(id);
    // }
};

/**
 * @return {!Promise<number>} 0 if success, or -errno if failured.
 */
NodeFS.prototype.Rename = function(olddirid, oldname, newdirid, newname) {
    console.log('NodeFS.prototype.Rename');
  const oldPath = this.GetChildFullPath(olddirid, oldname);
  const newPath = this.GetChildFullPath(newdirid, newname);

  return new Promise((res, rej) => this.fs.rename(oldPath, newPath, err => {
    if (err) rej(err);
    else {
      delete this.ids[oldPath];
      res();
    }
  }));
};

/** @private */
NodeFS.prototype.withOpen = async function(path, mode, cb) {
    console.log('NodeFS.prototype.withOpen');
  const fd = await new Promise((res, rej) => this.fs.open(path, mode, (err, fd) => {
    if (err) rej(err);
    else res(fd);
  }));
  // const fd = this.fs.openSync(path, mode);
  try {
    return await cb(fd);
  } finally {
    await new Promise((res, rej) => this.fs.close(fd, err => {
      if (err) rej(err);
      else res();
    }));
  }
}

/** @private */
NodeFS.prototype.withOpenSync = async function(path, mode, cb) {
    console.log('NodeFS.prototype.withOpenSync');
  const fd = this.fs.openSync(path, mode);
  try {
    return cb(fd);
  } finally {
    this.fs.closeSync(fd);
  }
}

NodeFS.prototype.Write = async function(id, offset, count, buffer) {
    console.log('NodeFS.prototype.Write');
    this.NotifyListeners(id, 'write');

    const path = this.GetFullPath(id);
    return this.withOpen(path, 'w', fd => new Promise((res, rej) =>
        this.fs.write(fd, Buffer.from(buffer), 0, count, offset, (err, bytesWritten, buffer) => {
          if (err)
            rej(err);
          else
            res(buffer);
        })));
};

NodeFS.prototype.Read = async function(inodeid, offset, count) {
    console.log('NodeFS.prototype.Read');
    const data = this.inodedata[inodeid];
    if (data) {
      return data.subarray(offset, offset + count);
    }
    const path = this.GetFullPath(inodeid);
    const buffer = new Uint8Array(count); // TODO(ochafik): reuse
    return this.withOpen(path, 'r', fd => new Promise((res, rej) =>
        this.fs.read(fd, Buffer.from(buffer), 0, count, offset, (err, bytesRead, buffer) => {
          if (err)
            rej(err);
          else
            res(buffer.subarray(0, bytesRead));
        })));
};

/** @private */
NodeFS.prototype.GetChildFullPath = function(parentid, name) {
    console.log('NodeFS.prototype.GetChildFullPath');
  const parent = this.GetFullPath(parentid);
  const path = join(parent, name);
  return path;
};

NodeFS.prototype.TryStat = function(path) {
  try {
    return this.fs.statSync(path);
  } catch (e) {
    return null;
  }
};

NodeFS.prototype.Search = function(parentid, name) {
    console.log('NodeFS.prototype.Search');
    const path = this.GetChildFullPath(parentid, name);
    const stats = this.TryStat(path);
    if (!stats) {
      return -1;
    }
    return this.GetInodeId(path);
};

NodeFS.prototype.CountUsedInodes = function() {
    console.log('NodeFS.prototype.CountUsedInodes');
    let count = this.inodes.length;
    return count;
};

NodeFS.prototype.CountFreeInodes = function() {
    console.log('NodeFS.prototype.CountFreeInodes');
    let count = 1024 * 1024;
    return count;
};

NodeFS.prototype.GetTotalSize = function() {
    console.log('NodeFS.prototype.GetTotalSize');
    let size = this.used_size;
    return size;
    //var size = 0;
    //for(var i=0; i<this.inodes.length; i++) {
    //    var d = this.inodes[i].data;
    //    size += d ? d.length : 0;
    //}
    //return size;
};

NodeFS.prototype.GetSpace = function() {
    console.log('NodeFS.prototype.GetSpace');
    let size = this.total_size;
    return this.total_size;
};

/**
 * XXX: Not ideal.
 * @param {number} idx
 * @return {string}
 */
NodeFS.prototype.GetDirectoryName = function(idx) {
    console.log('NodeFS.prototype.GetDirectoryName');
    const parent_inode = this.inodes[this.GetParent(idx)];

    // Root directory.
    if(!parent_inode) return "";

    for(const [name, childid] of parent_inode.direntries)
    {
        if(childid === idx) return name;
    }

    dbg_assert(false, "Filesystem: Found directory inode whose parent doesn't link to it");
    return "";
};

/** 
 * @param {!string} path
 * @return {number}
 */
NodeFS.prototype.GetInodeId = function(path) {
    console.log('NodeFS.prototype.GetInodeId');
  let inodeid = this.ids[path];
  if (inodeid == null) {
    this.ids[path] = inodeid = this.nextinodeid++;
    this.paths[inodeid] = path;
  }
  return inodeid;
};

/** 
 * @param {number} inodeid
 * @return {!string}
 */
 NodeFS.prototype.GetFullPath = function(inodeid) {
  if (inodeid === 0) {
    return '/';
  }
  const path = this.paths[inodeid];
  dbg_assert(path != null, "Filesystem: Cannot get full path of unknown inode");
  return path;
};

/**
 * @param {number} parentid
 * @param {number} targetid
 * @param {string} name
 * @return {number} 0 if success, or -errno if failured.
 */
NodeFS.prototype.Link = function(parentid, targetid, name) {
    console.log('NodeFS.prototype.Link');
  throw 'TODO: NodeFS.prototype.Link';
    // if(this.IsDirectory(targetid))
    // {
    //     return -EPERM;
    // }

    // const parent_inode = this.inodes[parentid];
    // const inode = this.inodes[targetid];

    // this.link_under_dir(parentid, targetid, name);
    // return 0;
};

NodeFS.prototype.Unlink = function(parentid, name) {
    console.log('NodeFS.prototype.Unlink');
  throw 'TODO: NodeFS.prototype.Unlink';
  
    // if(name === "." || name === "..")
    // {
    //     // Also guarantees that root cannot be deleted.
    //     return -EPERM;
    // }
    // const idx = this.Search(parentid, name);
    // const inode = this.inodes[idx];
    // const parent_inode = this.inodes[parentid];
    // //message.Debug("Unlink " + inode.name);

    // if(this.IsDirectory(idx) && !this.IsEmpty(idx))
    // {
    //     return -ENOTEMPTY;
    // }

    // this.unlink_from_dir(parentid, name);

    // if(inode.nlinks === 0)
    // {
    //     // don't delete the content. The file is still accessible
    //     inode.status = STATUS_UNLINKED;
    //     this.NotifyListeners(idx, 'delete');
    // }
    // return 0;
};

/**
 * @param {number} idx
 * @return {!Inode}
 */
NodeFS.prototype.GetInode = function(idx) {
    console.log('NodeFS.prototype.GetInode');
    dbg_assert(!isNaN(idx), "Filesystem GetInode: NaN idx");
    // dbg_assert(idx >= 0 && idx < this.inodes.length, "Filesystem GetInode: out of range idx:" + idx);

    let qidnumber = this.qidnumbers[idx];
    if (qidnumber == null) {
      this.qidnumbers[idx] = qidnumber = ++this.qidcounter.last_qidnumber;
    }

    // TODO(ochafik): Wrap in Object.defineProperties with getters that call
    // statSync systematically to get fresh data.
    // this.inodes[idx] = 
    const inode = new Inode(qidnumber);
    const path = this.GetFullPath(idx);
    if (path != null) {
      const stats = this.TryStat(path);
      const parent = basename(path);
      const parentStats = parent && this.TryStat(parent);

      inode.uid = stats ? stats.uid : parentStats ? parentStats.uid : 0;
      inode.guid = stats ? stats.guid : parentStats ? parentStats.guid : 0;
      inode.mode = stats ? stats.mode : parentStats ? (parentStats.mode & 0x1B6) : 0;

      if (stats) {
        inode.ctime = stats.ctimeMs;
        inode.atime = stats.atimeMs;
        inode.mtime = stats.mtimeMs;
        inode.size = stats.size;
        inode.nlinks = stats.nlink;
        
        // https://nodejs.org/api/fs.html#class-fsstats
        // https://www.gnu.org/software/libc/manual/html_node/Testing-File-Type.html
        const mask = 
            stats.isFile() ? S_IFREG
            : stats.isDirectory() ? S_IFDIR
            : stats.isSymbolicLink() ? S_IFLNK
            : stats.isFIFO() ? S_IFIFO
            : stats.isSocket() ? S_IFSOCK
            : stats.isBlockDevice() ? S_IFBLK
            : stats.isCharacterDevice() ? S_IFCHR
            : 0;
        inode.mode = stats.mode | mask;

        if (stats.isDirectory()) {
          const children = this.read_dir(path);
          if (children) {
            for (const child of children) {
              const childpath = join(path, child);
              const childid = this.GetInodeId(childpath);
              inode.direntries.set(child, childid);
            }
          }
        }
      }
    }
    return inode;
};

NodeFS.prototype.ChangeSize = async function(idx, newsize) {
    console.log('NodeFS.prototype.ChangeSize');
  const path = this.GetFullPath(idx);
  this.fs.truncateSync(path, newsize);
};

NodeFS.prototype.SearchPath = function(path) {
    console.log('NodeFS.prototype.SearchPath');
    //path = path.replace(/\/\//g, "/");
    path = path.replace("//", "/");

    const getNameEnd = (s, nameEnd = s.length) => {
      while (nameEnd > 0 && nameEnd <= s.length && s[nameEnd - 1] === '/') {
        nameEnd--;
      }
      return nameEnd;
    }

    let nameEnd = getNameEnd(path);
    const nameStart = path.lastIndexOf('/', nameEnd);
    const name = path.substring(nameStart, nameEnd);
    const parent = nameStart === 0 ? '/' : path.substr(0, getNameEnd(nameStart - 1));

    path = path.substring(0, nameEnd);

    return {
      id: this.GetInodeId(path),
      parentid: this.GetInodeId(parent),
      name
    }
};
// -----------------------------------------------------

NodeFS.prototype.RecursiveDelete = function(path) {
    console.log('NodeFS.prototype.RecursiveDelete');
  throw 'TODO: NodeFS.prototype.RecursiveDelete';
    // var toDelete = [];
    // var ids = this.SearchPath(path);
    // if(ids.id === -1) return;

    // this.GetRecursiveList(ids.id, toDelete);

    // for(var i=toDelete.length-1; i>=0; i--)
    // {
    //     const ret = this.Unlink(toDelete[i].parentid, toDelete[i].name);
    //     dbg_assert(ret === 0, "Filesystem RecursiveDelete failed at parent=" + toDelete[i].parentid +
    //         ", name='" + toDelete[i].name + "' with error code: " + (-ret));
    // }
};

NodeFS.prototype.DeleteNode = function(path) {
    console.log('NodeFS.prototype.DeleteNode');
    
  throw 'TODO: NodeFS.prototype.DeleteNode';
    // var ids = this.SearchPath(path);
    // if (ids.id == -1) return;

    // if ((this.inodes[ids.id].mode&S_IFMT) == S_IFREG){
    //     const ret = this.Unlink(ids.parentid, ids.name);
    //     dbg_assert(ret === 0, "Filesystem DeleteNode failed with error code: " + (-ret));
    //     return;
    // }
    // if ((this.inodes[ids.id].mode&S_IFMT) == S_IFDIR){
    //     this.RecursiveDelete(path);
    //     const ret = this.Unlink(ids.parentid, ids.name);
    //     dbg_assert(ret === 0, "Filesystem DeleteNode failed with error code: " + (-ret));
    //     return;
    // }
};

/** @param {*=} info */
NodeFS.prototype.NotifyListeners = function(id, action, info) {
    console.log('NodeFS.prototype.NotifyListeners');
    //if(info==undefined)
    //    info = {};

    //var path = this.GetFullPath(id);
    //if (this.watchFiles[path] == true && action=='write') {
    //  message.Send("WatchFileEvent", path);
    //}
    //for (var directory of this.watchDirectories) {
    //    if (this.watchDirectories.hasOwnProperty(directory)) {
    //        var indexOf = path.indexOf(directory)
    //        if(indexOf == 0 || indexOf == 1)
    //            message.Send("WatchDirectoryEvent", {path: path, event: action, info: info});
    //    }
    //}
};


NodeFS.prototype.Check = function() {
    console.log('NodeFS.prototype.Check');
  // TODO: check that all the paths exist!
};

NodeFS.prototype.IsDirectory = function(idx) {
    console.log('NodeFS.prototype.IsDirectory');
    const path = this.GetFullPath(idx);
    if (!path) {
      return false;
    }
    const stats = this.TryStat(path);
    return stats != null && stats.isDirectory();
};

NodeFS.prototype.IsEmpty = function(idx) {
    console.log('NodeFS.prototype.IsEmpty');
  const path = this.GetFullPath(idx);
  if (!path) {
    return true;
  }
  const children = this.fs.readdirSync(path);
  return children.length > 0;
};

NodeFS.prototype.GetChildren = function(idx) {
    console.log('NodeFS.prototype.GetChildren');
    dbg_assert(this.IsDirectory(idx), "Filesystem: cannot get children of non-directory inode");
    const path = this.GetFullPath(idx);
    if (!path) {
      return [];
    }
    return this.fs.readdirSync(path) || [];
};

NodeFS.prototype.GetParent = function(idx) {
    console.log('NodeFS.prototype.GetParent');
    const path = this.GetFullPath(idx);
    if (!path) {
      return -1;
    }
    const parent = basename(path);
    if (parent == null) return -1;

    const parentid = this.ids[parent];
    dbg_assert(parentid >= 0, "Filesystem: cannot get parentid!");

    return parentid;
};


// -----------------------------------------------------

NodeFS.prototype.PrepareCAPs = function(id) {
    console.log('NodeFS.prototype.PrepareCAPs');
  throw 'TODO: NodeFS.prototype.PrepareCAPs';
};

NodeFS.prototype.Mount = function(path, fs) {
    console.log('NodeFS.prototype.Mount');
    dbg_assert(false, "Cannot mount filesystem in NodeFS.");

    return -EOPNOTSUPP;
};

NodeFS.prototype.DescribeLock = function(type, start, length, proc_id, client_id) {
    console.log('NodeFS.prototype.DescribeLock');
  throw 'TODO: NodeFS.prototype.DescribeLock';
    // dbg_assert(type === P9_LOCK_TYPE_RDLCK ||
    //     type === P9_LOCK_TYPE_WRLCK ||
    //     type === P9_LOCK_TYPE_UNLCK,
    //     "Filesystem: Invalid lock type: " + type);
    // dbg_assert(start >= 0, "Filesystem: Invalid negative lock starting offset: " + start);
    // dbg_assert(length > 0, "Filesystem: Invalid non-positive lock length: " + length);

    // const lock = new FSLockRegion();
    // lock.type = type;
    // lock.start = start;
    // lock.length = length;
    // lock.proc_id = proc_id;
    // lock.client_id = client_id;

    // return lock;
};

NodeFS.prototype.GetLock = function(id, request) {
    console.log('NodeFS.prototype.GetLock');
  throw 'TODO: NodeFS.prototype.GetLock';
    // return null;
};

NodeFS.prototype.Lock = function(id, request, flags) {
    console.log('NodeFS.prototype.Lock');
  throw 'TODO: NodeFS.prototype.Lock';
  // return P9_LOCK_ERROR;
  // return P9_LOCK_SUCCESS;
};

NodeFS.prototype.read_dir = function(path) {
    console.log('NodeFS.prototype.read_dir');
    return this.fs.readdirSync(path);
};

NodeFS.prototype.read_file = function(file) {
    console.log('NodeFS.prototype.read_file');
    return new Promise((res, rej) => this.fs.readFile(file, e => e ? rej(e) : res()));
};

