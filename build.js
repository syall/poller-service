import Sourcer from './config/Sourcer.js';
import dotenv from 'dotenv';

(function main() {
    dotenv.config({ path: './config/.env' });
    new Sourcer().start();
})();
