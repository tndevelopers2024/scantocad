import { countries as countryData } from 'country-data';

// Get all countries in consistent format
export const getConsistentCountries = () => {
  return Object.values(countryData.all)
    .filter(country => country.alpha2 && country.name)
    .sort((a, b) => a.name.localeCompare(b.name));
};

// Get country name by code (using package's codes)
export const getCountryName = (code) => {
  const country = Object.values(countryData.all).find(
    c => c.alpha2 === code.toUpperCase()
  );
  return country?.name || code;
};

// Get first currency for country
export const getCountryCurrency = (code) => {
  const country = Object.values(countryData.all).find(
    c => c.alpha2 === code.toUpperCase()
  );
  return country?.currencies?.[0] || 'USD';
};