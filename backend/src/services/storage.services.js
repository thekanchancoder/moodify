
const ImageKit = require("@imagekit/nodejs");

const client = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

async function uploadFile({ buffer, fileName, folder = "" }) {
    const fileDetails = await client.files.upload({
        file: await ImageKit.toFile(buffer, fileName),
        fileName: fileName,
        folder: folder,
    });

    return fileDetails;
}

module.exports = { uploadFile };
