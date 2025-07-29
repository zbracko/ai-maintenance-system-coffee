// src/components/LanguageSelector.tsx
import React from 'react';
import { Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [language, setLanguage] = React.useState<string>(i18n.language);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const lang = event.target.value as string;
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <FormControl variant="outlined" size="small" sx={{ minWidth: 120, marginRight: 2 }}>
      <InputLabel id="language-selector-label">{t('language')}</InputLabel>
      <Select
        labelId="language-selector-label"
        value={language}
        onChange={handleChange}
        label={t('language')}
      >
        {/* Primary languages - fully supported */}
        <MenuItem value="en">🇺🇸 English</MenuItem>
        <MenuItem value="es">🇪🇸 Español</MenuItem>
        <MenuItem value="fr">🇫🇷 Français</MenuItem>
        
        {/* Other languages - grayed out and disabled */}
        <MenuItem value="ru" disabled sx={{ color: 'rgba(0, 0, 0, 0.38)' }}>🇷🇺 Русский (Coming Soon)</MenuItem>
        <MenuItem value="vi" disabled sx={{ color: 'rgba(0, 0, 0, 0.38)' }}>🇻🇳 Tiếng Việt (Coming Soon)</MenuItem>
        <MenuItem value="zh" disabled sx={{ color: 'rgba(0, 0, 0, 0.38)' }}>🇨🇳 中文 (Coming Soon)</MenuItem>
        <MenuItem value="de" disabled sx={{ color: 'rgba(0, 0, 0, 0.38)' }}>🇩🇪 Deutsch (Coming Soon)</MenuItem>
        <MenuItem value="it" disabled sx={{ color: 'rgba(0, 0, 0, 0.38)' }}>🇮🇹 Italiano (Coming Soon)</MenuItem>
        <MenuItem value="pt" disabled sx={{ color: 'rgba(0, 0, 0, 0.38)' }}>🇵🇹 Português (Coming Soon)</MenuItem>
        <MenuItem value="hi" disabled sx={{ color: 'rgba(0, 0, 0, 0.38)' }}>🇮🇳 हिंदी (Coming Soon)</MenuItem>
        <MenuItem value="ar" disabled sx={{ color: 'rgba(0, 0, 0, 0.38)' }}>🇸🇦 العربية (Coming Soon)</MenuItem>
        <MenuItem value="ja" disabled sx={{ color: 'rgba(0, 0, 0, 0.38)' }}>🇯🇵 日本語 (Coming Soon)</MenuItem>
        <MenuItem value="ko" disabled sx={{ color: 'rgba(0, 0, 0, 0.38)' }}>🇰🇷 한국어 (Coming Soon)</MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;
