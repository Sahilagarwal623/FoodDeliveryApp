import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = process.env.ENCRYPTION_KEY || '';

const iv = crypto.randomBytes(16);

export function encrypt(text: string): string {

  if (!key) {
    throw new Error('ENCRYPTION_KEY is not set in environment variables');
  }

    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;

}


export function decrypt(text: string): string {

    const [ivHex, encrypted] = text.split(':');
    const decipher = crypto.createDecipheriv(
        algorithm,
        Buffer.from(key),
        Buffer.from(ivHex, 'hex')
    );

    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;

}