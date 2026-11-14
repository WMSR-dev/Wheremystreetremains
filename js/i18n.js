export let LANG = 'en';

export function t(field){
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[LANG] || field.en || '';

  // potentially might need to turn these || into ?? depending on whether we want empty strings to never be empty
}
