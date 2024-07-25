import * as FileSaver from 'file-saver';
import { caniuse } from 'caniuse';

const inputElement = document.getElementById('file');
const outputFormatSelect = document.getElementById('output-format');
const convertButton = document.getElementById('convert-btn');
const downloadLink = document.getElementById('download-link');
const statusElement = document.getElementById('status');

convertButton.addEventListener('click', async () => {
    const file = inputElement.files[0];
    const outputFileFormat = outputFormatSelect.value;
    if (!file) return;

    statusElement.innerText = 'Converting file...';

    try {
        if (file.type.startsWith('image/')) {
            await convertImage(file, outputFileFormat);
        } else if (file.type.startsWith('video/')) {
            await convertVideo(file, outputFileFormat);
        } else {
            throw new Error('Unsupported file type');
        }

        downloadLink.href = URL.createObjectURL(fileBuffer);
        downloadLink.download = file.name + '.' + outputFileFormat;
        downloadLink.click();
    } catch (error) {
        statusElement.innerText = 'Error: ' + error.message;
    }
});

async function convertImage(file, outputFileFormat) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = URL.createObjectURL(file);

    image.onload = async () => {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);

        fileBuffer = await new Promise(resolve => {
            canvas.toBlob(async (blob) => {
                resolve(blob);
            }, 'image/' + outputFileFormat);
        });
    };
}

async function convertVideo(file, outputFileFormat) {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.controls = true;
    video.play();

    let frameCount = 0;
    let animationFrameId;

    animationFrameId = setInterval(() => {
        canvas.width = video.width;
        canvas.height = video.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        frameCount++;

        if (frameCount >= video.duration * 30) {
            clearInterval(animationFrameId);

            fileBuffer = await new Promise(resolve => {
                canvas.toBlob(async (blob) => {
                    resolve(blob);
                }, 'video/' + outputFileFormat);
            });
        }
    }, 30);
}