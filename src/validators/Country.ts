import countries from 'i18n-iso-countries';
import enJson from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(enJson);

export default class Country {

    /**
     * Checks if the country code is valid.
     * @param countryCode - The ISO 3166-1 alpha-2 country code.
     * @returns a `boolean`.
    */
    public static isValidCountryCode(countryCode: string): boolean {
        return countries.isValid(countryCode.toUpperCase());
    }

    /**
     * Checks if the country name is valid.
     * @param countryName - The country name.
     * @returns a `boolean`.
     */
    public static isValidCountryName(countryName: string): boolean {
        const countryCode = countries.getAlpha2Code(countryName, 'en');
        return countryCode !== undefined;
    }

    /**
     * Get country name from country code.
     * @param countryCode - The ISO 3166-1 alpha-2 country code.
     * @param language - The language code for the country name (default is 'en').
     * @returns The country name or `undefined` if not found.
     */
    public static getCountryNameFromCode(countryCode: string, language: string = 'en'): string | undefined {
        return countries.getName(countryCode.toUpperCase(), language);
    }

    public static validateCountry(country: string) {

        if (Country.isValidCountryName(country)) {
            return country;
        }
        if (Country.isValidCountryCode(country)) {
            const countryName = Country.getCountryNameFromCode(country);
            return countryName ?? null;
        }
        return null;
    }
}
