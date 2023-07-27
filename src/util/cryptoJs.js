import CryptoJS from "crypto-js";

export const encrypt = (payload) => {
  try {
    const secret_key = process.env.REACT_APP_CRYPTO_SECRET_KEY;
    if (!secret_key) {
      console.log("No Secret Key.");
      return null;
    }
    const jsonData = JSON.stringify(payload);
    const encrypted = CryptoJS.AES.encrypt(jsonData, secret_key).toString();
    return encrypted;
  } catch (e) {
    console.log("Encryption error occur : ", e);
    return null;
  }
};
export const decrypt = (encrypted) => {
  try {
    const secret_key = process.env.REACT_APP_CRYPTO_SECRET_KEY;
    if (!secret_key) {
      console.log("No Secret Key.");
      return null;
    }
    const decrypted_bytes = CryptoJS.AES.decrypt(encrypted, secret_key);
    const decrypted = decrypted_bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (e) {
    console.log("Decryption error occur : ", e);
    return null;
  }
};
