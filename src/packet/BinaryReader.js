'use strict';
/*
 * Simple BinaryReader is a minimal tool to read binary stream.
 * Useful for binary deserialization.
 *
 * Copyright (c) 2016 Barbosik https://github.com/Barbosik
 * License: Apache License, Version 2.0
 */

function BinaryReader(buffer) {
    this._offset = 0;
    this._buffer = parseInt(process.version[1]) < 6 ? new Buffer(buffer) : Buffer.from(buffer);
}

module.exports = BinaryReader;

BinaryReader.prototype.readInt16 = function () {
    var value = this._buffer.readInt16LE(this._offset);
    this._offset += 2;
    return value;
};

BinaryReader.prototype.readInt32 = function () {
    var value = this._buffer.readInt32LE(this._offset);
    this._offset += 4;
    return value;
};

BinaryReader.prototype.readDouble = function () {
    var value = this._buffer.readDoubleLE(this._offset);
    this._offset += 8;
    return value;
};

BinaryReader.prototype.skipBytes = function (length) {
    this._offset += length;
};

BinaryReader.prototype.readStringZeroUtf8 = function () {
    var length = 0;
    var endLength = 0;
    for (var i = this._offset; i < this._buffer.length; i++) {
        if (!this._buffer.readUInt8(i)) {
            endLength = 1;
            break;
        }
        length++;
    }
    var value = this._buffer.toString('utf8', this._offset, this._offset + length);
    this._offset += endLength;
    return value;
};

BinaryReader.prototype.readStringZeroUnicode = function () {
    var length = 0;
    var endLength = ((this._buffer.length - this._offset) & 1) != 0 ? 1 : 0;
    for (var i = this._offset; i + 1 < this._buffer.length; i += 2) {
        if (!this._buffer.readUInt16LE(i)) {
            endLength = 2;
            break;
        }
        length += 2;
    }
    var safe = Math.max(0, length - (length % 2));
    var value = this._buffer.toString('ucs2', this._offset, this._offset + safe);
    this._offset += endLength;
    return value;
};
