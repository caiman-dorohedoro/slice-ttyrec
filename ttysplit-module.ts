const splitTtyrec = async (file: File, startFrame?: number, endFrame?: number): Promise<Uint8Array | number> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  
  // Check for empty file
  if (buffer.length === 0) {
    throw new Error('File is empty');
  }
  
  let position = 0;
  let frameNum = 0;
  let closestFrameClear = -1;
  
  // first pass: count frames and find clear frames
  while (position + 12 < buffer.length) {
    const header = buffer.slice(position, position + 12);

    const len = (((((header[11] << 8) | header[10]) << 8) | header[9]) << 8) | header[8];
    
    if (position + 12 + len <= buffer.length) {
      const frameBuffer = buffer.slice(position + 12, position + 12 + len);
      
      // check for clear frames
      const frameData = new TextDecoder().decode(frameBuffer);
      if (frameData.indexOf('\x1B[2J') >= 0 && frameNum > closestFrameClear && startFrame !== undefined && frameNum < startFrame) {
        closestFrameClear = frameNum;
      }
      
      frameNum++;
      position += (12 + len);
    } else {
      throw new Error('Invalid ttyrec file format');
    }
  }
  
  // Validate parameters if provided
  if (startFrame !== undefined && endFrame !== undefined) {
    // First check if start frame is greater than end frame
    if (startFrame > endFrame) {
      throw new Error('Start frame must be less than or equal to end frame');
    }
    // Then check if frames are out of range
    if (startFrame >= frameNum) {
      throw new Error('Start frame is out of range');
    }
    if (endFrame > frameNum) {
      throw new Error('End frame is out of range');
    }
  }
  
  // return frame count if no start or end frame
  if (startFrame === undefined && endFrame === undefined) {
    return frameNum;
  }
  
  // second pass: extract needed frames
  position = 0;
  frameNum = 0;
  
  if (closestFrameClear !== -1) {
    startFrame = closestFrameClear;
  }
  
  // create array to hold results
  const resultChunks: Uint8Array[] = [];
  
  while (position + 12 < buffer.length) {
    const header = buffer.slice(position, position + 12);
    
    const len = (((((header[11] << 8) | header[10]) << 8) | header[9]) << 8) | header[8];
    
    if (position + 12 + len <= buffer.length) {
      const frameBuffer = buffer.slice(position + 12, position + 12 + len);
      
      // if within range, add to results
      if ((startFrame === undefined || frameNum >= startFrame) && (endFrame === undefined || frameNum <= endFrame)) {
        resultChunks.push(header);
        resultChunks.push(frameBuffer);
      }
      
      frameNum++;
      position += (12 + len);
    } else {
      throw new Error('Invalid ttyrec file format');
    }
  }
  
  // combine all chunks into one Uint8Array
  const totalLength = resultChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  
  let offset = 0;
  for (const chunk of resultChunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return result;
}

export default splitTtyrec;