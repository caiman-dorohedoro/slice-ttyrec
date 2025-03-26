import { Buffer } from "node:buffer";
import { expect } from "jsr:@std/expect";
import splitTtyrec from '../ttysplit-module.ts';

Deno.test('should return frame number wihtout start end frame parameters', async () => {
  const buffer = Buffer.alloc(12 + 5);
  buffer.writeUInt32LE(0, 0);
  buffer.writeUInt32LE(0, 4);
  buffer.writeUInt32LE(5, 8);
  buffer.write('baced', 12);
  
  const file = new File([buffer], 'test.ttyrec');
  const result = await splitTtyrec(file);
  expect(result).toBe(1);
})

Deno.test('should return frame number without parameters in multiple frames', async () => {
  const buffer = Buffer.alloc(24 + 8);
  buffer.writeUInt32LE(0, 0);
  buffer.writeUInt32LE(0, 4);
  buffer.writeUInt32LE(5, 8);
  buffer.write('baced', 12);
  
  buffer.writeUInt32LE(1, 17); 
  buffer.writeUInt32LE(0, 21);
  buffer.writeUInt32LE(3, 25);
  buffer.write('abc', 29);
  
  const file = new File([buffer], 'test.ttyrec');
  const result = await splitTtyrec(file);
  expect(result).toBe(2);
})

Deno.test('should return splitted frames with parameters', async () => {
  const buffer = Buffer.alloc(24 + 8);
  buffer.writeUInt32LE(0, 0);
  buffer.writeUInt32LE(0, 4);
  buffer.writeUInt32LE(5, 8);
  buffer.write('baced', 12);
  
  buffer.writeUInt32LE(1, 17);    // sec = 1
  buffer.writeUInt32LE(0, 21);    // usec = 0
  buffer.writeUInt32LE(3, 25);    // len = 3
  buffer.write('abc', 29);        // data = 'abc'
  
  const file = new File([buffer], 'test.ttyrec');
  const result = await splitTtyrec(file, 1, 2);
  
  const expected = Buffer.alloc(12 + 3);
  expected.writeUInt32LE(1, 0);
  expected.writeUInt32LE(0, 4);
  expected.writeUInt32LE(3, 8);
  expected.write('abc', 12);

  if (result instanceof Uint8Array) {
    expect(result).toEqual(new Uint8Array(expected));
  } else {
    throw new Error('Expected Uint8Array but got number');
  }
})
