import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
import routes from '../routes/index.js';
import ErrorHandler from '../middlewares/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(routes);
app.use(ErrorHandler);
app.use('/albums/images', express.static(
    path.join(__dirname, '../services/storage/file/images/')
));

export default app;