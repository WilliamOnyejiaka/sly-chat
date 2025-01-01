import CryptoJS from 'crypto-js';
import { logger } from '../config';

export default class CipherUtility {

    public static encrypt(text: string, secretKey: string) {
        const encrypted = CryptoJS.AES.encrypt(text, secretKey).toString();
        return encrypted;
    }

    public static decrypt(encryptedText: string, secretKey: string) {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            return {
                error: false,
                originalText: originalText
            };
        } catch (error) {
            logger.error(error);
            return {
                error: true,
                originalText: null
            }
        }
    }
}