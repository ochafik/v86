// -------------------------------------------------
// ----------------- FILESYSTEM---------------------
// -------------------------------------------------
// Implementation of a unix filesystem in memory.

"use strict";

var S_IRWXUGO = 0x1FF;
var S_IFMT = 0xF000;
var S_IFSOCK = 0xC000;
var S_IFLNK = 0xA000;
var S_IFREG = 0x8000;
var S_IFBLK = 0x6000;
var S_IFDIR = 0x4000;
var S_IFCHR = 0x2000;
var S_IFIFO = 0x1000;

//var S_IFIFO  0010000
//var S_ISUID  0004000
//var S_ISGID  0002000
//var S_ISVTX  0001000

var O_RDONLY = 0x0000; // open for reading only
var O_WRONLY = 0x0001; // open for writing only
var O_RDWR = 0x0002; // open for reading and writing
var O_ACCMODE = 0x0003; // mask for above modes

var STATUS_INVALID = -0x1;
var STATUS_OK = 0x0;
var STATUS_ON_STORAGE = 0x2;
var STATUS_UNLINKED = 0x4;
var STATUS_FORWARDING = 0x5;


/** @const */ var JSONFS_VERSION = 3;


/** @const */ var JSONFS_IDX_NAME = 0;
/** @const */ var JSONFS_IDX_SIZE = 1;
/** @const */ var JSONFS_IDX_MTIME = 2;
/** @const */ var JSONFS_IDX_MODE = 3;
/** @const */ var JSONFS_IDX_UID = 4;
/** @const */ var JSONFS_IDX_GID = 5;
/** @const */ var JSONFS_IDX_TARGET = 6;
/** @const */ var JSONFS_IDX_SHA256 = 6;


/** @constructor */
function Inode(qidnumber)
{
    this.direntries = new Map(); // maps filename to inode id
    this.status = 0;
    this.size = 0x0;
    this.uid = 0x0;
    this.gid = 0x0;
    this.fid = 0;
    this.ctime = 0;
    this.atime = 0;
    this.mtime = 0;
    this.major = 0x0;
    this.minor = 0x0;
    this.symlink = "";
    this.mode = 0x01ED;
    this.qid = {
        type: 0,
        version: 0,
        path: qidnumber,
    };
    this.caps = undefined;
    this.nlinks = 0;
    this.sha256sum = "";

    /** @type{!Array<!FSLockRegion>} */
    this.locks = []; // lock regions applied to the file, sorted by starting offset.

    // For forwarders:
    this.mount_id = -1; // which fs in this.mounts does this inode forward to?
    this.foreign_id = -1; // which foreign inode id does it represent?

    //this.qid_type = 0;
    //this.qid_version = 0;
    //this.qid_path = qidnumber;
}

Inode.prototype.get_state = function()
{
    const state = new Array(14);
    state[0] = this.mode;

    if((this.mode & S_IFMT) === S_IFDIR)
    {
        state[1] = [...this.direntries];
    }
    else if((this.mode & S_IFMT) === S_IFREG)
    {
        state[1] = this.sha256sum;
    }
    else if((this.mode & S_IFMT) === S_IFLNK)
    {
        state[1] = this.symlink;
    }
    else if((this.mode & S_IFMT) === S_IFSOCK)
    {
        state[1] = [this.minor, this.major];
    }
    else
    {
        state[1] = null;
    }

    state[2] = this.locks;
    state[3] = this.status;
    state[4] = this.size;
    state[5] = this.uid;
    state[6] = this.gid;
    state[7] = this.fid;
    state[8] = this.ctime;
    state[9] = this.atime;
    state[10] = this.mtime;
    state[11] = this.qid.version;
    state[12] = this.qid.path;
    state[13] = this.nlinks;

    //state[23] = this.mount_id;
    //state[24] = this.foreign_id;
    //state[25] = this.caps; // currently not writable
    return state;
};

/**
 * @param {!FS} fs
 * @return {!Uint8Array}
 */
Inode.prototype.getDirectoryData = function(fs) {
  let size = 0;
  for(const name of this.direntries.keys())
  {
      size += 13 + 8 + 1 + 2 + UTF8.UTF8Length(name);
  }
  const data = new Uint8Array(size);
  this.size = size;

  let offset = 0x0;
  for(const [name, id] of this.direntries)
  {
      const child = fs.GetInode(id);
      offset += marshall.Marshall(
          ["Q", "d", "b", "s"],
          [child.qid,
          offset+13+8+1+2+UTF8.UTF8Length(name),
          child.mode >> 12,
          name],
          data, offset);
  }
  return data;
};

Inode.prototype.set_state = function(state)
{
    this.mode = state[0];

    if((this.mode & S_IFMT) === S_IFDIR)
    {
        this.direntries = new Map();
        for(const [name, entry] of state[1])
        {
            this.direntries.set(name, entry);
        }
    }
    else if((this.mode & S_IFMT) === S_IFREG)
    {
        this.sha256sum = state[1];
    }
    else if((this.mode & S_IFMT) === S_IFLNK)
    {
        this.symlink = state[1];
    }
    else if((this.mode & S_IFMT) === S_IFSOCK)
    {
        [this.minor, this.major] = state[1];
    }
    else
    {
        // Nothing
    }

    this.locks = [];
    for(const lock_state of state[2])
    {
        const lock = new FSLockRegion();
        lock.set_state(lock_state);
        this.locks.push(lock);
    }
    this.status = state[3];
    this.size = state[4];
    this.uid = state[5];
    this.gid = state[6];
    this.fid = state[7];
    this.ctime = state[8];
    this.atime = state[9];
    this.mtime = state[10];
    this.qid.type = (this.mode & S_IFMT) >> 8;
    this.qid.version = state[11];
    this.qid.path = state[12];
    this.nlinks = state[13];

    //this.mount_id = state[23];
    //this.foreign_id = state[24];
    //this.caps = state[20];
};

/**
 * @interface
 * @param {!FileStorageInterface} storage
 * @param {{ last_qidnumber: number }=} qidcounter Another fs's qidcounter to synchronise with.
 */
function FS(storage, qidcounter) {}

/** @return {!Array} */
FS.prototype.get_state = function() {};

/** @param {!Array} state */
FS.prototype.set_state = function(state) {};

FS.prototype.AddEvent = function(id, OnEvent) {};

FS.prototype.load_from_json = function(fs, done) {};

// Note: parentid = -1 for initial root directory.
/** @return {number} */
FS.prototype.CreateDirectory = function(name, parentid) {};

/** @return {number} */
FS.prototype.CreateFile = function(filename, parentid) {};

/** @return {number} */
FS.prototype.CreateNode = function(filename, parentid, major, minor) {};

/** @return {number} */
FS.prototype.CreateSymlink = function(filename, parentid, symlink) {};

/** @return {!Promise<number>} */
FS.prototype.CreateTextFile = function(filename, parentid, str) {};

/**
 * @param {Uint8Array} buffer
 * @return {!Promise<number>}
 */
FS.prototype.CreateBinaryFile = function(filename, parentid, buffer) {};

/**
 * @param {number} id
 * @param {number|undefined} mode
 * @return {boolean}
 */
FS.prototype.OpenInode = function(id, mode) {};

/**
 * @param {number} id
 * @return {!Promise<void>}
 */
FS.prototype.CloseInode = function(id) {};

/**
 * @param {number} olddirid
 * @param {string} oldname
 * @param {number} newdirid
 * @param {string} newname
 * @return {!Promise<number>} 0 if success, or -errno if failured.
 */
FS.prototype.Rename = function(olddirid, oldname, newdirid, newname) {};

/**
 * @param {number} id
 * @param {number} offset
 * @param {number} count
 * @param {!Uint8Array} buffer
 * @return {!Promise<void>}
 */
FS.prototype.Write = function(id, offset, count, buffer) {};

/**
 * @param {number} inodeid
 * @param {number} offset
 * @param {number} count
 * @return {!Promise<Uint8Array|undefined>}
 */
FS.prototype.Read = function(inodeid, offset, count) {};

/**
 * @param {number} parentid
 * @param {string} name
 * @return {number}
 */
FS.prototype.Search = function(parentid, name) {};

/** @return {number} */
FS.prototype.CountUsedInodes = function() {};

/** @return {number} */
FS.prototype.CountFreeInodes = function() {};

/** @return {number} */
FS.prototype.GetTotalSize = function() {};

/** @return {number} */
FS.prototype.GetSpace = function() {};

/**
 * @param {number} parentid
 * @param {number} targetid
 * @param {string} name
 * @return {number} 0 if success, or -errno if failured.
 */
FS.prototype.Link = function(parentid, targetid, name) {};

/**
 * @param {number} parentid
 * @param {string} name
 * @return {number} 0 if success, or -errno if failured.
 */
FS.prototype.Unlink = function(parentid, name) {};

/**
 * @param {number} idx
 * @return {!Inode}
 */
FS.prototype.GetInode = function(idx) {};

/**
 * @param {number} idx
 * @param {number} newsize
 * @return {!Promise<void>}
 */
FS.prototype.ChangeSize = function(idx, newsize) {};

/**
 * @param {string} path
 * @return {{id: number, parentid: number, name: string, forward_path: (string|null|undefined)}}
 */
FS.prototype.SearchPath = function(path) {};

/**
 * @param {string} path
 */
FS.prototype.RecursiveDelete = function(path) {};

/**
 * @param {string} path
 */
 FS.prototype.DeleteNode = function(path) {};

FS.prototype.Check = function() {};

/**
 * @param {number} dirid
 * @param {number} offset_target
 * @return {number}
 */
 FS.prototype.RoundToDirentry = function(dirid, offset_target) {};

/**
 * @param {number} idx
 * @return {boolean}
 */
FS.prototype.IsDirectory = function(idx) {};

/**
 * @param {number} idx
 * @return {boolean}
 */
FS.prototype.IsEmpty = function(idx) {};

/**
 * @param {number} idx
 * @return {!Array<string>} List of children names
 */
FS.prototype.GetChildren = function(idx) {};

/**
 * @param {number} idx
 * @return {number} Local idx of parent
 */
FS.prototype.GetParent = function(idx) {};

// -----------------------------------------------------

// only support for security.capabilities
// should return a  "struct vfs_cap_data" defined in
// linux/capability for format
// check also:
//   sys/capability.h
//   http://lxr.free-electrons.com/source/security/commoncap.c#L376
//   http://man7.org/linux/man-pages/man7/capabilities.7.html
//   http://man7.org/linux/man-pages/man8/getcap.8.html
//   http://man7.org/linux/man-pages/man3/libcap.3.html
/** @return {number} */
FS.prototype.PrepareCAPs = function(id) {};

/**
 * Mount another filesystem to given path.
 * @param {string} path
 * @param {FS} fs
 * @return {number} inode id of mount point if successful, or -errno if mounting failed.
 */
FS.prototype.Mount = function(path, fs) {};

/**
 * @constructor
 */
function FSLockRegion()
{
    this.type = P9_LOCK_TYPE_UNLCK;
    this.start = 0;
    this.length = Infinity;
    this.proc_id = -1;
    this.client_id = "";
}

FSLockRegion.prototype.get_state = function()
{
    const state = [];

    state[0] = this.type;
    state[1] = this.start;
    // Infinity is not JSON.stringify-able
    state[2] = this.length === Infinity ? 0 : this.length;
    state[3] = this.proc_id;
    state[4] = this.client_id;

    return state;
};

FSLockRegion.prototype.set_state = function(state)
{
    this.type = state[0];
    this.start = state[1];
    this.length = state[2] === 0 ? Infinity : state[2];
    this.proc_id = state[3];
    this.client_id = state[4];
};

/**
 * @return {FSLockRegion}
 */
FSLockRegion.prototype.clone = function()
{
    const new_region = new FSLockRegion();
    new_region.set_state(this.get_state());
    return new_region;
};

/**
 * @param {FSLockRegion} region
 * @return {boolean}
 */
FSLockRegion.prototype.conflicts_with = function(region)
{
    if(this.proc_id === region.proc_id && this.client_id === region.client_id) return false;
    if(this.type === P9_LOCK_TYPE_UNLCK || region.type === P9_LOCK_TYPE_UNLCK) return false;
    if(this.type !== P9_LOCK_TYPE_WRLCK && region.type !== P9_LOCK_TYPE_WRLCK) return false;
    if(this.start + this.length <= region.start) return false;
    if(region.start + region.length <= this.start) return false;
    return true;
};

/**
 * @param {FSLockRegion} region
 * @return {boolean}
 */
FSLockRegion.prototype.is_alike = function(region)
{
    return region.proc_id === this.proc_id &&
        region.client_id === this.client_id &&
        region.type === this.type;
};

/**
 * @param {FSLockRegion} region
 * @return {boolean}
 */
FSLockRegion.prototype.may_merge_after = function(region)
{
    return this.is_alike(region) && region.start + region.length === this.start;
};

/**
 * @param {number} type
 * @param {number} start
 * @param {number} length
 * @param {number} proc_id
 * @param {string} client_id
 * @return {!FSLockRegion}
 */
FS.prototype.DescribeLock = function(type, start, length, proc_id, client_id) {};

/**
 * @param {number} id
 * @param {FSLockRegion} request
 * @return {FSLockRegion} The first conflicting lock found, or null if requested lock is possible.
 */
FS.prototype.GetLock = function(id, request) {};

/**
 * @param {number} id
 * @param {FSLockRegion} request
 * @param {number} flags
 * @return {number} One of P9_LOCK_SUCCESS / P9_LOCK_BLOCKED / P9_LOCK_ERROR / P9_LOCK_GRACE.
 */
FS.prototype.Lock = function(id, request, flags) {};

/**
 * @param {string} path
 * @return {Array<string>|undefined}
 */
FS.prototype.read_dir = function(path) {};

/**
 * @param {string} file
 * @return {!Promise<Uint8Array|undefined>}
 */
FS.prototype.read_file = function(file) {};
