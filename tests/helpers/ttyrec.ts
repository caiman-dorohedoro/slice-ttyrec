import { Buffer } from "node:buffer";

export interface TtyrecFrame {
  sec: number;
  usec: number;
  data: string;
}

/**
 * Creates a single frame ttyrec file
 * @param sec Seconds timestamp
 * @param usec Microseconds timestamp
 * @param data Frame data
 * @returns Buffer containing the ttyrec frame
 */
export function createTtyrecFrame(sec: number, usec: number, data: string): Buffer {
  const buffer = Buffer.alloc(12 + data.length);
  buffer.writeUInt32LE(sec, 0);
  buffer.writeUInt32LE(usec, 4);
  buffer.writeUInt32LE(data.length, 8);
  buffer.write(data, 12);
  return buffer;
}

/**
 * Creates a multi-frame ttyrec file
 * @param frames Array of frames with their timestamps and data
 * @returns Buffer containing the ttyrec frames
 */
export function createMultiFrameTtyrec(frames: TtyrecFrame[]): Buffer {
  const totalLength = frames.reduce((acc, frame) => acc + 12 + frame.data.length, 0);
  const buffer = Buffer.alloc(totalLength);
  
  let offset = 0;
  for (const frame of frames) {
    buffer.writeUInt32LE(frame.sec, offset);
    buffer.writeUInt32LE(frame.usec, offset + 4);
    buffer.writeUInt32LE(frame.data.length, offset + 8);
    buffer.write(frame.data, offset + 12);
    offset += 12 + frame.data.length;
  }
  
  return buffer;
} 