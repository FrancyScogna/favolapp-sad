import comuniJSON from '../data/comuni.json';
import provinceJSON from '../data/province.json';
import CodiceFiscale from 'codice-fiscale-js';
import { Chance } from "chance";
const chance = new Chance();

export function generateRandomPassword(length) {
    const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const specialChars = '^$*.[]{}()?-"!@#%&/\\,><\':;|_~`+=';
    const numberChars = '0123456789';
  
    function getRandomChar(charSet) {
      const randomIndex = Math.floor(Math.random() * charSet.length);
      return charSet[randomIndex];
    }
  
    const passwordArray = [
      getRandomChar(upperCaseChars),
      getRandomChar(lowerCaseChars),
      getRandomChar(specialChars),
      getRandomChar(numberChars),
    ];
  
    const allChars = upperCaseChars + lowerCaseChars + specialChars + numberChars;
    for (let i = passwordArray.length; i < length; i++) {
      passwordArray.push(getRandomChar(allChars));
    }
  
    for (let i = passwordArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
    }
  
    return passwordArray.join('');
  }

  export function getInvalidSecret(){

    return `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC0eQEPh1+cDXvm
OpSzXTNweO5+99cogBAA5k1WLYUWNXBVMhk3VC3aQKqeNvmfKLgvbkpUtrzAf8tL
mkRs9jBoP2QMmDrMh2Czi/RvP7TQO+/PyfNL2utu845xG80/1cJKsjjStxK4CGxQ
stx1BeQHGFciwxaG/P6oHra5ifQNhAjlBjBiLkGZEr0kUkbH7P/Pzp4L1OGdbxJL
k8LiLzKOaeAo0MFgO5+E172CyfE+EyH27RIGt2yI6Q3YYB3URYoMDmYJ24pEyhgq
kcBSBHQcxNdi/eO1A8Ri/SnQ3UDlX3W6LbMwKK8pg0Wv0i20xH++e5+DqnKjF1zd
aCivFqLNAgMBAAECggEAEqHwllgZaqzotxUiv572fdz6cKDpdZy9Kj6cyvIxrKCR
S7Z7rH70KfWlt+aAoKpNU9ZM9dCVDcHT7ScM+/vx9P1geL1pyq6KcRcYwjifVCVw
BbG5vQHp7z9VnD9s0jOhVuFuJPEyTU5PUoiY4rscNxBQBL6ED6VErHpZTrAbwp5M
AhjuaNEO/gH41HObZbaKY7SR0sjEhf+lRg+c9ZIIyELpvEbtYR+JX4Om5WQ94NWN
gnAf0r70iBlCc+HQs5Q9cefwpppGAoXZaBl+WXMycEP6dNcpskN1hFEA0R3OcPBi
PwWG7It3dXPRSzSLFUBWQ3It6rvPIOSIgsJaCz5d4QKBgQDaa1LYOa2fqZb6l3QG
EY8URlipg15mSdrLXAr7/IDT4+A7wXPC0HyOD7aKZYyVzmVvhEfbDfwL0Csn7I85
z2x8NmhniGLu5IgqsJJtq405ey1QKWH8VrRsWIiB1GFGFwgKzozaCCjP6WSByRWd
S5xqaTC9j3PvHLEUTo3ft8gmoQKBgQDThkErAwmonsrjYmQ44ypp27JDSrQVimoX
JHgx7zmnpdkkjXnH4PizRAm8aktpfTAqvnrxfio2xS2t4eSjJ7SW/WOI/TZ8fdca
h8N4Vf1A83g6/DerHoO3NDcTL8/iwLCRhmZ7ChOG8m9Oae9f9ikdIDs2+N4W6ZZA
kFVcGO+IrQKBgQCVm5HBXbCZfnZV60ujpH9WqeCtK7iLY+ckCEXV2Fz9xkafZ6C9
PkUyoXytS2WCbz93pSn615dfGBWXYSext2xdoH7e+8KYU50ZcJy71hgD2WVuVQoy
58jptbK7CxgeBEST8mr0JUafMwSPCYdumI3pLWgfT5VfoU2B1VTEeoP0QQKBgQCc
YApZg/tl/06634h8TeSTMeoNuXJ84kEgLsP1FognGoL3dOftDrKNxOT1uBdcO0Ka
twso8T7AEvF8NR3USIxHe7hUE+5uBpI5eNjXY6rAk730zXVSOlLh4+Y7dwNW/WEL
lLK6j250O1JyQ/rFlLQ8ZhGgyEdX5QRBYvLYDU84WQKBgHipWibnBfMNWXbo+s6r
HuWt0ziYhtLNsBBNYSB/DW4ZEHLE5quJyLhFWim7M6YPJTV3Qt67ltr3dObtxYNk
HGO/+lO9INzEnY23khma6qOW6Z2wszxYFYRLioi4Nntl9BudZPV4QkMJFeKOvj6y
nwgefkeTJQdwfdpa9iy/p/i1
-----END PRIVATE KEY-----`;

  }


  export const getProvinciaComuneCodfis = (name, surname, birthdate, gender) => {
    // Seleziona una provincia casuale dal file provinceJSON
    const provincia = chance.pickone(provinceJSON).provincia;

    // Filtra i comuni appartenenti alla provincia selezionata
    const comuniInProvincia = comuniJSON.filter(comune => comune.provincia === provincia);

    // Se non ci sono comuni per la provincia, lancia un errore
    if (comuniInProvincia.length === 0) {
        throw new Error(`Nessun comune trovato per la provincia: ${provincia}`);
    }

    // Seleziona un comune casuale dalla provincia
    const comune = chance.pickone(comuniInProvincia).comune;

    const giornoNascita = parseInt(birthdate.split("-")[2]);
    const meseNascita = parseInt(birthdate.split("-")[1]);
    const annoNascita = parseInt(birthdate.split("-")[0]);

    // Costruisci un oggetto con i dati necessari per generare il codice fiscale
    const datiCodiceFiscale = {
        name: name,
        surname: surname,
        gender: gender,
        day: giornoNascita,
        month: meseNascita,
        year: annoNascita,
        birthplace: comune,
        birthplaceProvincia: provincia
    };

    // Genera il codice fiscale
    const codfis = new CodiceFiscale(datiCodiceFiscale);

    // Ritorna la provincia, il comune e il codice fiscale
    return {
        provincia: provincia,
        comune: comune,
        codfis: codfis.cf,
    };
};

export const generateSessions = (count) => {
  const sessions = [];

  for (let i = 0; i < count; i++) {
    const hours = Math.floor(Math.random() * 13) + 7;
    const minutes = Math.random() < 0.5 ? "00" : "30";
  
    const startHour = hours;
    const startMinute = minutes;
    const endHour = startHour + 1;
    const endMinute = startMinute === "30" ? "30" : "00";
  
    const session = {
      weekDay: chance.pickone([
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY"
      ]),
      startTime: `${startHour.toString().padStart(2, "0")}:${startMinute}`,
      endTime: `${endHour.toString().padStart(2, "0")}:${endMinute}`
    }

    sessions.push(session);
  }

  return sessions;
};