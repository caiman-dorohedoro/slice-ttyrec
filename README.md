# @caiman/slice-ttyrec

A TypeScript library for slicing ttyrec recordings, designed to work in both web browsers and Deno (Node.js compatible) environments.

### Overview
This package is a fork of [LtSquigs/ttysplit](https://github.com/LtSquigs/ttysplit), rewritten in TypeScript and modernized to work in web environments.


### Installation

```bash
# For Deno (using JSR)
deno add @caiman/slice-ttyrec

# For npm (coming soon)
npm install @caiman/slice-ttyrec
```

### API

```ts
sliceTtyrec(file: File, startFrame?: number, endFrame?: number): Promise<Uint8Array | number>
```

- **file**: A File object containing ttyrec data
- **startFrame** (optional): The first frame to include in the slice (1-based indexing)
- **endFrame** (optional): The last frame to include in the slice (1-based indexing)

- **Returns**:
  - When called without startFrame/endFrame: Returns the total number of frames (as a number)
  - When called with frame parameters: Returns a Uint8Array containing the sliced ttyrec data

### Examples

#### Browser
```ts
import sliceTtyrec from "@caiman/slice-ttyrec";

// Example using a file input element
document.getElementById('fileInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    // To get the total number of frames in a ttyrec file
    const frameCount = await sliceTtyrec(file);
    console.log(`The ttyrec file contains ${frameCount} frames.`);
    
    // To extract frames 0-9 from the ttyrec file
    const extractedFrames = await sliceTtyrec(file, 0, 9);
    
    // Now you can use the extracted frames (Uint8Array)
    if (extractedFrames instanceof Uint8Array) {
      const blob = new Blob([extractedFrames], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = 'extracted_frames.ttyrec';
      document.body.appendChild(downloadLink);
    }
  } catch (error) {
    console.error('Error processing ttyrec file:', error);
  }
});
```

#### Node.js
```ts
import fs from 'node:fs';
import sliceTtyrec from "@caiman/slice-ttyrec";

async function processTtyrec(filePath) {
  try {
    // Read the file from disk
    const buffer = fs.readFileSync(filePath);
    
    // Convert to File object (Node.js doesn't have File API natively)
    const file = new File([buffer], 'input.ttyrec');
    
    // Get the total number of frames
    const frameCount = await sliceTtyrec(file);
    console.log(`The ttyrec file contains ${frameCount} frames.`);
    
    // Extract frames 0-9
    const extractedFrames = await sliceTtyrec(file, 0, 9);
    
    // Save the extracted frames to disk
    if (extractedFrames instanceof Uint8Array) {
      fs.writeFileSync('extracted_frames.ttyrec', Buffer.from(extractedFrames));
      console.log('Extracted frames saved to extracted_frames.ttyrec');
    }
  } catch (error) {
    console.error('Error processing ttyrec file:', error);
  }
}

// Usage example
processTtyrec('./path/to/recording.ttyrec');
```

#### Deno
```ts
import sliceTtyrec from "@caiman/slice-ttyrec";

async function processTtyrec(filePath: string) {
  try {
    // Read the file from disk
    const fileData = await Deno.readFile(filePath);
    
    // Convert to File object
    const file = new File([fileData], 'input.ttyrec');
    
    // Get the total number of frames
    const frameCount = await sliceTtyrec(file);
    console.log(`The ttyrec file contains ${frameCount} frames.`);
    
    // Extract frames 0-9
    const extractedFrames = await sliceTtyrec(file, 0, 9);
    
    // Save the extracted frames to disk
    if (extractedFrames instanceof Uint8Array) {
      await Deno.writeFile('extracted_frames.ttyrec', extractedFrames);
      console.log('Extracted frames saved to extracted_frames.ttyrec');
    }
  } catch (error) {
    console.error('Error processing ttyrec file:', error);
  }
}

// Usage example
await processTtyrec('./path/to/recording.ttyrec');
```
