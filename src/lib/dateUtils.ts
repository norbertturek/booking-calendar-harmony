// Utility funkcje do bezpiecznego formatowania dat
// Unikają problemów z UTC conversion

/**
 * Formatuje datę do YYYY-MM-DD bez konwersji UTC
 * @param date - Date object
 * @returns string w formacie YYYY-MM-DD
 */
export const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Parsuje string daty do Date object (lokalna strefa czasowa)
 * @param dateString - string w formacie YYYY-MM-DD
 * @returns Date object
 */
export const parseStringToDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
};

/**
 * Sprawdza czy dwie daty to ten sam dzień (ignoruje czas)
 * @param date1 - pierwsza data
 * @param date2 - druga data
 * @returns boolean
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDateToString(date1) === formatDateToString(date2);
};

/**
 * Zwraca datę jako string w czytelnym formacie polskim
 * @param date - Date object lub string
 * @returns string w formacie polskim
 */
export const formatDateToPolish = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseStringToDate(date) : date;
  
  return dateObj.toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric', 
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Debug: porównuje różne metody formatowania daty
 * @param date - Date object
 */
export const debugDateFormats = (date: Date) => {
  console.group('🗓️ Date Debug:');
  console.log('Original date:', date);
  console.log('getFullYear():', date.getFullYear());
  console.log('getMonth():', date.getMonth(), '(0-indexed)');
  console.log('getDate():', date.getDate());
  console.log('toString():', date.toString());
  console.log('toDateString():', date.toDateString());
  console.log('toISOString():', date.toISOString());
  console.log('toISOString().split("T")[0]:', date.toISOString().split('T')[0]);
  console.log('formatDateToString():', formatDateToString(date));
  console.groupEnd();
}; 