import { useState, useEffect } from 'react';
import {
  TextField,
  MenuItem,
  InputAdornment,
  Select,
  Typography,
} from '@mui/material';
import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
} from 'libphonenumber-js';
import './PhoneNumberInput.css';
import { getName } from 'country-list';
import PropTypes from 'prop-types';

//Bisogna collegare l'impostazione iniziale del paese con i cookies
function PhoneNumberInput({
  textFieldProps,
  setIsValidNumberPhone,
  setNumberPhone,
  errorFromOut,
  numberPhone,
}) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selected, setSelected] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countries, setCountries] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const countryList = getCountries().map((country) => ({
      code: country,
      name: getName(country),
      callingCode: getCountryCallingCode(country),
    }));
    setCountries(countryList);

    //Impostare queste variabili iniziali con il paese ottenuto dai cookies
    setSelected('IT' || '');
    setSelectedCountry(countryList.find((country) => country.code === 'IT'));
    if (numberPhone) {
      setPhoneNumber(numberPhone ? numberPhone.split(' ')[1] : '');
      const selected = countryList.find(
        (country) =>
          country.callingCode === numberPhone.split(' ')[0].replace('+', '')
      );
      setSelectedCountry(selected);
      const validation = isValidPhoneNumber(
        `+${selected.callingCode}${numberPhone.split(' ')[1]}`,
        selected.code
      );
      setIsValidNumberPhone(validation);
      setIsValid(validation);
    }
  }, [numberPhone]);

  const handlePhoneNumberChange = (event) => {
    setError(false);
    const number = event.target.value;
    setPhoneNumber(number);
    const validation = isValidPhoneNumber(
      `+${selectedCountry.callingCode}${number}`,
      selectedCountry.code
    );
    setIsValidNumberPhone(validation);
    setIsValid(validation);
    setNumberPhone(`+${selectedCountry.callingCode} ${number}`);
  };

  const handleCountryChange = (event) => {
    const countryCode = event.target.value;
    setSelected(countryCode);
    setSelectedCountry(
      countries.find((country) => country.code === countryCode)
    );
  };

  const onBlurTextField = () => {
    if (!isValid && phoneNumber !== '') {
      setError(true);
    } else {
      setError(false);
    }
  };

  useEffect(() => {
    setError(false);
    if (errorFromOut) {
      setError(true);
    } else {
      setError(false);
    }
  }, [errorFromOut]);

  return (
    <TextField
      {...textFieldProps}
      type='number'
      value={phoneNumber}
      onChange={handlePhoneNumberChange}
      onBlur={onBlurTextField}
      error={error}
      helperText={
        error && 'Numero di telefono errato per il paese selezionato.'
      }
      InputProps={{
        style: { height: '100%', padding: 0 },
        startAdornment: (
          <InputAdornment position='start'>
            <Select
              value={selected}
              size={textFieldProps.size ? textFieldProps.size : 'medium'}
              onChange={handleCountryChange}
              className='phonenumberinput-select'
              renderValue={(countryCode) => (
                <img
                  className='phonenumberinput-flag-icon'
                  src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${countryCode}.svg`}
                />
              )}
            >
              {countries.map((country) => (
                <MenuItem key={country.code} value={country.code}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      className='phonenumberinput-flag-icon'
                      src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${country.code}.svg`}
                    />
                    {`${country.name ? country.name : ''} +${country.callingCode}`}
                  </div>
                </MenuItem>
              ))}
            </Select>
            {selectedCountry && (
              <Typography
                style={{
                  color: phoneNumber !== '' && 'black',
                  marginTop: '2px',
                }}
              >
                +{selectedCountry.callingCode}
              </Typography>
            )}
          </InputAdornment>
        ),
      }}
    />
  );
}

PhoneNumberInput.propTypes = {
  textFieldProps: PropTypes.object,
  setIsValidNumberPhone: PropTypes.func,
  setNumberPhone: PropTypes.func,
  errorFromOut: PropTypes.bool,
  numberPhone: PropTypes.string,
};

export default PhoneNumberInput;
