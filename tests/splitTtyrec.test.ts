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
