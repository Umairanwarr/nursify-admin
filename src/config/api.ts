/**
 * Global API Configuration for Admin Portal
 * 
 * ✨ IP ADDRESS IS AUTO-DETECTED when you run `npm start` in the Server folder.
 * The detected IP is automatically updated here and in all other configs.
 * 
 * If you need to manually change it, update the SERVER_IP variable below.
 * Or run: cd Server && npm run update-ip
 * 
 * To find your IP address manually:
 * - Windows: Open CMD and type 'ipconfig', look for IPv4 Address
 * - Mac/Linux: Open Terminal and type 'ifconfig' or 'ip addr'
 */

// ⚠️ This IP is auto-updated when server starts, but you can manually change it if needed
const SERVER_IP = '192.168.0.109';
const SERVER_PORT = '5000';

// Production API URL
export const API_URL = `https://nursify-backend--nwareacc01.replit.app/api`;

// Export individual parts if needed
export const BASE_URL = `https://nursify-backend--nwareacc01.replit.app`;
export const SERVER_CONFIG = {
  ip: SERVER_IP,
  port: SERVER_PORT,
  apiUrl: API_URL,
  baseUrl: BASE_URL,
};

export default API_URL;
