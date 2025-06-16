/**
 * Shortens an Ethereum address to a more readable format
 * @param {string} address - The full Ethereum address
 * @returns {string} The shortened address
 */
export const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Formats a Unix timestamp to a readable date
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Validates if a string is a valid Ethereum address
 * @param {string} address - The address to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Formats a number to a currency string
 * @param {number|string} value - The value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, decimals = 4) => {
  if (!value) return '0';
  
  const number = parseFloat(value);
  return number.toFixed(decimals).replace(/\.?0+$/, '');
};

