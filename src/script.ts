import * as FileSaver from 'file-saver';

const inputElement = document.getElementById('file');
const outputFormatSelect = document.getElementById('output-format');
const convertButton = document.getElementById('convert-btn');
const downloadLink = document.getElementById('download-link');

convertButton.addEventListener('click', async () => {
    const file = inputElement.files[0];
    const outputFileFormat = outputFormatSelect.value;
    if (!file) return;

    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const image = new Image();
        image.src = URL.createObjectURL(file);

        image.onload = () => {
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);
            const outputFileBuffer = await new Promise(resolve => {
                canvas.toBlob(async (blob) => {
                    resolve(blob);
                }, 'image/' + outputFileFormat);
            });

            const outputFileUrl = URL.createObjectURL(outputFileBuffer);
            downloadLink.href = outputFileUrl;
            downloadLink.download = file.name + '.' + outputFileFormat;
        };
    } catch (error) {
        console.error(error);
    }
});