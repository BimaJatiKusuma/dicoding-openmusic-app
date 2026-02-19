import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class StorageService{
    constructor(folder) {
        this.folder = folder;

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true});
        }
    }

    writeFile(file, meta){
        const filename = new Date() + meta.filename;
        const path = `${this.folder}/${filename}`;

        const fileStream = fs.createWriteStream(path);

        return new Promise((resolve, reject) => {
            fileStream.on('error', (error) => reject(error));
            fileStream.write(file.buffer);
            fileStream.end(() => resolve(filename));
        });
    }
}

export default StorageService;