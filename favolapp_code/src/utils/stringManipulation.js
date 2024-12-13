export const removeSpacesFromString = (string) => {
  return string.replace(/\s/g, '');
};

export function convertToAWSDate(day, month, year) {
  // Creare una data utilizzando l'oggetto Date
  const date = new Date(year, month - 1, day);

  // Verificare che la data sia valida
  if (isNaN(date.getTime())) {
    throw new Error('Data non valida');
  }

  // Ottenere i componenti della data
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // Mesi da 0 a 11
  const dd = String(date.getDate()).padStart(2, '0');

  // Formattare la data come YYYY-MM-DD
  return `${yyyy}-${mm}-${dd}`;
}
