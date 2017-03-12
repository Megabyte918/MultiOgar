'use strict';
/*
 * Simple BinaryWriter is a minimal tool to write binary stream with unpredictable size.
 * Useful for binary serialization.
 *
 * Copyright (c) 2016 Barbosik https://github.com/Barbosik
 * License: Apache License, Version 2.0
 */

const oldNode = parseInt(process.version[1]) < 6;
const allocMax = 1048576;

global.sharedBuffer = oldNode ? new Buffer(allocMax) : Buffer.allocUnsafe(allocMax);
global.allocLength = 0;

function BinaryWriter() {
    allocLength = 0;
}

module.exports = BinaryWriter;

BinaryWriter.prototype.writeUInt8 = function(value) {
    sharedBuffer.writeUInt8(value, allocLength++, true);
};

BinaryWriter.prototype.writeUInt16 = function(value) {
    sharedBuffer.writeUInt16LE(value, allocLength, true);
    allocLength += 2;
};

BinaryWriter.prototype.writeUInt32 = function(value) {
    sharedBuffer.writeUInt32LE(value, allocLength, true);
    allocLength += 4;
};

BinaryWriter.prototype.writeFloat = function(value) {
    sharedBuffer.writeFloatLE(value, allocLength, true);
    allocLength += 4;
};

BinaryWriter.prototype.writeDouble = function(value) {
    sharedBuffer.writeDoubleLE(value, allocLength, true);
    allocLength += 8;
};

BinaryWriter.prototype.writeBytes = function(data) {
    data.copy(sharedBuffer, allocLength, 0, data.length);
    allocLength += data.length;
};

BinaryWriter.prototype.writeStringZeroUtf8 = function(value) {
    var length = Buffer.byteLength(value, 'utf8');
    sharedBuffer.write(value, allocLength, 'utf8');
    allocLength += length;
    this.writeUInt8(0);
};

BinaryWriter.prototype.writeStringZeroUnicode = function(value) {
    var length = Buffer.byteLength(value, 'ucs2');
    sharedBuffer.write(value, allocLength, 'ucs2');
    allocLength += length;
    this.writeUInt16(0);
};

BinaryWriter.prototype.toBuffer = function() {
    var newBuf = oldNode ? new Buffer(allocLength) : Buffer.allocUnsafe(allocLength);
    sharedBuffer.copy(newBuf, 0, 0, allocLength);
    return newBuf;
};
