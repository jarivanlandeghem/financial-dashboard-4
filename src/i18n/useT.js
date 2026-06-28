import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { TRANSLATIONS } from './translations';

export function useT() {
  const { language } = useContext(AppContext);
  const dict = TRANSLATIONS[language] || TRANSLATIONS.nl;
  return (key) => dict[key] ?? key;
}
