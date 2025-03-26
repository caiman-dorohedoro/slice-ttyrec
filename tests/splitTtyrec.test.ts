import { Buffer } from "node:buffer";
import { expect } from "jsr:@std/expect";
import splitTtyrec from '../ttysplit-module.ts';
import { createTtyrecFrame, createMultiFrameTtyrec } from './helpers/ttyrec.ts';

Deno.test('should return frame number without start end frame parameters', async () => {
  const buffer = createTtyrecFrame(0, 0, 'baced');
  const file = new File([buffer], 'test.ttyrec');
  const result = await splitTtyrec(file);
  expect(result).toBe(1);
})

Deno.test('should return frame number without parameters in multiple frames', async () => {
  const frames = [
    { sec: 0, usec: 0, data: 'baced' },
    { sec: 1, usec: 0, data: 'abc' }
  ];
  const buffer = createMultiFrameTtyrec(frames);
  const file = new File([buffer], 'test.ttyrec');
  const result = await splitTtyrec(file);
  expect(result).toBe(2);
})

Deno.test('should return splitted frames with parameters', async () => {
  const frames = [
    { sec: 0, usec: 0, data: 'baced' },
    { sec: 1, usec: 0, data: 'abc' }
  ];
  const buffer = createMultiFrameTtyrec(frames);
  const file = new File([buffer], 'test.ttyrec');
  const result = await splitTtyrec(file, 1, 2);
  
  const expected = createTtyrecFrame(1, 0, 'abc');

  if (result instanceof Uint8Array) {
    expect(result).toEqual(new Uint8Array(expected));
  } else {
    throw new Error('Expected Uint8Array but got number');
  }
})

Deno.test('should throw error for invalid ttyrec file format', async () => {
  // Create a buffer with invalid header (length field is incorrect)
  const buffer = Buffer.alloc(12 + 5);
  buffer.writeUInt32LE(0, 0);
  buffer.writeUInt32LE(0, 4);
  buffer.writeUInt32LE(10, 8);  // length is 10 but actual data is 5 bytes
  buffer.write('baced', 12);
  
  const file = new File([buffer], 'test.ttyrec');
  await expect(splitTtyrec(file)).rejects.toThrow('Invalid ttyrec file format');
});

Deno.test('should throw error for invalid parameters', async () => {
  const frames = [
    { sec: 0, usec: 0, data: 'baced' },
    { sec: 1, usec: 0, data: 'abc' }
  ];
  const buffer = createMultiFrameTtyrec(frames);
  const file = new File([buffer], 'test.ttyrec');

  // Test with start frame out of range
  await expect(splitTtyrec(file, 3, 3)).rejects.toThrow('Start frame is out of range');

  // Test with end frame out of range
  await expect(splitTtyrec(file, 1, 3)).rejects.toThrow('End frame is out of range');

  // Test with start frame > end frame
  await expect(splitTtyrec(file, 2, 1)).rejects.toThrow('Start frame must be less than or equal to end frame');
});

Deno.test('should throw error for empty file', async () => {
  const buffer = Buffer.alloc(0);
  const file = new File([buffer], 'test.ttyrec');
  
  await expect(splitTtyrec(file)).rejects.toThrow('File is empty');
});

Deno.test('should throw when start frame is out of range', async () => {
  // Create a file with exactly 2 frames
  const frames = [
    { sec: 0, usec: 0, data: 'first' },
    { sec: 1, usec: 0, data: 'second' }
  ];
  const buffer = createMultiFrameTtyrec(frames);
  const file = new File([buffer], 'test.ttyrec');
  
  // Use the exact frame count (2) to avoid triggering other validations
  await expect(splitTtyrec(file, 2, 2)).rejects.toThrow('Start frame is out of range');
});

Deno.test('should throw when start frame > end frame', async () => {
  // Create a file with enough frames to avoid range issues
  const frames = [
    { sec: 0, usec: 0, data: 'frame1' },
    { sec: 1, usec: 0, data: 'frame2' },
    { sec: 2, usec: 0, data: 'frame3' },
    { sec: 3, usec: 0, data: 'frame4' }
  ];
  const buffer = createMultiFrameTtyrec(frames);
  const file = new File([buffer], 'test.ttyrec');
  
  // Use values that are within range but with start > end
  await expect(splitTtyrec(file, 2, 1)).rejects.toThrow('Start frame must be less than or equal to end frame');
});
