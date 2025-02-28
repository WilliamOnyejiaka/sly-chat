"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18n_iso_countries_1 = __importDefault(require("i18n-iso-countries"));
const en_json_1 = __importDefault(require("i18n-iso-countries/langs/en.json"));
i18n_iso_countries_1.default.registerLocale(en_json_1.default);
class Country {
    /**
     * Checks if the country code is valid.
     * @param countryCode - The ISO 3166-1 alpha-2 country code.
     * @returns a `boolean`.
    */
    static isValidCountryCode(countryCode) {
        return i18n_iso_countries_1.default.isValid(countryCode.toUpperCase());
    }
    /**
     * Checks if the country name is valid.
     * @param countryName - The country name.
     * @returns a `boolean`.
     */
    static isValidCountryName(countryName) {
        const countryCode = i18n_iso_countries_1.default.getAlpha2Code(countryName, 'en');
        return countryCode !== undefined;
    }
    /**
     * Get country name from country code.
     * @param countryCode - The ISO 3166-1 alpha-2 country code.
     * @param language - The language code for the country name (default is 'en').
     * @returns The country name or `undefined` if not found.
     */
    static getCountryNameFromCode(countryCode, language = 'en') {
        return i18n_iso_countries_1.default.getName(countryCode.toUpperCase(), language);
    }
    static validateCountry(country) {
        if (Country.isValidCountryName(country)) {
            return country;
        }
        if (Country.isValidCountryCode(country)) {
            const countryName = Country.getCountryNameFromCode(country);
            return countryName !== null && countryName !== void 0 ? countryName : null;
        }
        return null;
    }
}
exports.default = Country;
