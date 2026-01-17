// D:\PRJ_YCT_Final\utils\templateParser.js

/**
 * Parses a template string and replaces variables with values from data.
 * Variables should be in {{path.to.value}} format.
 * Also supports general variables like {{currentDate}}, {{currentTime}}, etc.
 *
 * @param {string} templateString - The string containing variables (e.g., "Hello {{leadData.firstName}}").
 * @param {object} data - The data object to extract values from (e.g., eventData).
 * @returns {string} The parsed string with variables replaced.
 */
const parseTemplateString = (templateString, data) => {
    if (typeof templateString !== 'string') {
        return templateString; // Return as is if not a string
    }

    // Helper to get general variables
    const getGeneralVariable = (varName) => {
        const now = new Date();
        switch (varName) {
            case 'currentDate':
                return now.toISOString().split('T')[0]; // YYYY-MM-DD
            case 'currentTime':
                return now.toTimeString().split(' ')[0]; // HH:MM:SS
            case 'currentDateTime':
                return now.toISOString();
            case 'timestamp':
                return Math.floor(now.getTime() / 1000).toString();
            default:
                return undefined;
        }
    };

    return templateString.replace(/\{\{(.*?)\}\}/g, (match, path) => {
        // Trim whitespace from the path
        const trimmedPath = path.trim();

        // Check for general variables first (no dots)
        if (!trimmedPath.includes('.')) {
            const generalValue = getGeneralVariable(trimmedPath);
            if (generalValue !== undefined) {
                return generalValue;
            }
        }

        // Safely get nested value using a reduce function
        const value = trimmedPath.split('.').reduce((obj, key) => {
            if (obj && typeof obj === 'object') {
                // Handle both direct property access and nested objects
                if (key in obj) {
                    return obj[key];
                }
                // Try camelCase conversion for some common fields
                const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
                if (camelKey in obj) {
                    return obj[camelKey];
                }
            }
            return undefined;
        }, data);

        // If value is found, return it, otherwise return the original placeholder
        return value !== undefined ? String(value) : match;
    });
};

module.exports = {
    parseTemplateString
};