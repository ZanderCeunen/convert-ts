import { createFFmpeg } from '@ffmpeg/ffmpeg';

// Get elements from HTML
const fileInput = document.getElementById('file') as HTMLInputElement;
const outputFormatSelect = document.getElementById('output-format') as HTMLSelectElement;
const convertBtn = document.getElementById('convert-btn') as HTMLButtonElement;
const downloadLink = document.getElementById('download-link') as HTMLAnchorElement;

// Create a new FFmpeg instance
let ffmpeg: any;

// Handle file selection
fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    const outputFormat = outputFormatSelect.value;

    // Convert the file
    if (ffmpeg) {
        await ffmpeg.close();
        ffmpeg.destroy();
        delete ffmpeg;
        ffmpeg = null;
    }
    ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();

    switch (outputFormat) {
        case 'jpg':
            await convertJpg(file);
            break;
        case 'png':
            await convertPng(file);
            break;
        case 'heic':
            await convertHeic(file);
            break;
        case 'mp4':
            await convertMp4(file);
            break;
        case 'avi':
            await convertAvi(file);
            break;
        default:
            alert('Invalid output format');
            return;
    }

    // Download the converted file
    const blob = await getConvertedFile();
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = `converted.${outputFormat}`;
    downloadLink.style.display = 'block';
});

// Handle conversion logic for each format
async function convertJpg(file) {
    const jpgBuffer = await convertFileToBuffer(file, 'image/jpeg');
    const pngBuffer = await convertJpgToPng(jpgBuffer);
    return pngBuffer;
}

async function convertPng(file) {
    const pngBuffer = await convertFileToBuffer(file, 'image/png');
    return pngBuffer;
}

async function convertHeic(file) {
    const heicBuffer = await convertFileToBuffer(file, 'image/heic');
    const jpgBuffer = await convertHeicToJpg(heicBuffer);
    return jpgBuffer;
}

async function convertMp4(file) {
    const mp4Buffer = await convertFileToBuffer(file, 'video/mp4');
    const aviBuffer = await convertMp4ToAvi(mp4Buffer);
    return aviBuffer;
}

async function convertAvi(file) {
    const aviBuffer = await convertFileToBuffer(file, 'video/avi');
}

async function getConvertedFile() {
  const blob = new Blob([await this.convertedBuffer], { type: this.outputFormat });
  return blob;
}

async function getConvertedFileBlob() {
  const blob = new Blob([await this.convertedBlob], { type: this.outputFormat });
  return blob;
}

// Conversion functions

async function convertFileToBuffer(file, mimeType) {
  const reader = new FileReader();
  return new Promise((resolve) => {
      reader.onload = () => {
          resolve(new Uint8Array(reader.result));
      };
      reader.readAsArrayBuffer(file);
  });
}

async function convertJpgToPng(jpgBuffer) {
  const options = {
      input: 'pipe:',
      output: 'pipe:',
      options: [
          '-i',
          '-',
          '-c:v',
          'png'
      ]
  };

  const inputPipe = ffmpeg.FS('writePipe', 'input.jpg', jpgBuffer);
  await ffmpeg.run(inputPipe);
  const pngData = ffmpeg.FS('readPipe', 'pipe:');
  return pngData.buffer;
}

async function convertHeicToJpg(heicBuffer) {
  const options = {
      input: 'pipe:',
      output: 'pipe:',
      options: [
          '-i',
          '-',
          '-c:v',
          'libx264'
      ]
  };

  const inputPipe = ffmpeg.FS('writePipe', 'input.heic', heicBuffer);
  await ffmpeg.run(inputPipe);
  const jpgData = ffmpeg.FS('readPipe', 'pipe:');
  return jpgData.buffer;
}

async function convertMp4ToAvi(mp4Buffer) {
  const options = {
      input: 'pipe:',
      output: 'pipe:',
      options: [
          '-i',
          '-',
          '-c:v',
          'msvideo1'
      ]
  };

  const inputPipe = ffmpeg.FS('writePipe', 'input.mp4', mp4Buffer);
  await ffmpeg.run(inputPipe);
  const aviData = ffmpeg.FS('readPipe', 'pipe:');
  return aviData.buffer;
}