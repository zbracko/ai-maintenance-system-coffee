// src/components/LanguageSelector.tsx
import React from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [language, setLanguage] = React.useState<string>(i18n.language);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
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

<MenuItem value="en">English</MenuItem>
        <MenuItem value="es">Español</MenuItem>
        <MenuItem value="fr">Français</MenuItem>
        <MenuItem value="ru">Russian</MenuItem>
        <MenuItem value="vi">Vietnamese</MenuItem>
        <MenuItem value="zh">Chinese</MenuItem>
        <MenuItem value="de">Deutsch</MenuItem>
        <MenuItem value="it">Italiano</MenuItem>
        <MenuItem value="pt">Português</MenuItem>
        <MenuItem value="hi">Hindi</MenuItem>
        <MenuItem value="ar">Arabic</MenuItem>
        <MenuItem value="ja">Japanese</MenuItem>
        <MenuItem value="ko">Korean</MenuItem>
        <MenuItem value="tr">Turkish</MenuItem>
        <MenuItem value="pl">Polish</MenuItem>
        <MenuItem value="uk">Ukrainian</MenuItem>
        <MenuItem value="nl">Dutch</MenuItem>
        <MenuItem value="sv">Swedish</MenuItem>
        <MenuItem value="no">Norwegian</MenuItem>
        <MenuItem value="fi">Finnish</MenuItem>
        <MenuItem value="da">Danish</MenuItem>
        <MenuItem value="el">Greek</MenuItem>
        <MenuItem value="he">Hebrew</MenuItem>
        <MenuItem value="th">Thai</MenuItem>
        <MenuItem value="id">Indonesian</MenuItem>
        <MenuItem value="hu">Hungarian</MenuItem>
        <MenuItem value="cs">Czech</MenuItem>
        <MenuItem value="ro">Romanian</MenuItem>
        <MenuItem value="sk">Slovak</MenuItem>
        <MenuItem value="bg">Bulgarian</MenuItem>
        <MenuItem value="hr">Croatian</MenuItem>
        <MenuItem value="lt">Lithuanian</MenuItem>
        <MenuItem value="lv">Latvian</MenuItem>
        <MenuItem value="sl">Slovenian</MenuItem>
        <MenuItem value="et">Estonian</MenuItem>
        <MenuItem value="ms">Malay</MenuItem>
        <MenuItem value="fa">Persian</MenuItem>
        <MenuItem value="sw">Swahili</MenuItem>
        <MenuItem value="tl">Tagalog</MenuItem>
        <MenuItem value="ca">Catalan</MenuItem>
        <MenuItem value="eu">Basque</MenuItem>
        <MenuItem value="gl">Galician</MenuItem>
        <MenuItem value="sq">Albanian</MenuItem>
        <MenuItem value="mk">Macedonian</MenuItem>
        <MenuItem value="sr">Serbian</MenuItem>
        <MenuItem value="bs">Bosnian</MenuItem>
        <MenuItem value="is">Icelandic</MenuItem>
        <MenuItem value="mt">Maltese</MenuItem>
        <MenuItem value="af">Afrikaans</MenuItem>
        <MenuItem value="yo">Yoruba</MenuItem>
        <MenuItem value="zu">Zulu</MenuItem>
        <MenuItem value="am">Amharic</MenuItem>
        <MenuItem value="ne">Nepali</MenuItem>
        <MenuItem value="bn">Bengali</MenuItem>
        <MenuItem value="pa">Punjabi</MenuItem>
        <MenuItem value="gu">Gujarati</MenuItem>
        <MenuItem value="ta">Tamil</MenuItem>
        <MenuItem value="te">Telugu</MenuItem>
        <MenuItem value="mr">Marathi</MenuItem>
        <MenuItem value="ur">Urdu</MenuItem>
        <MenuItem value="si">Sinhala</MenuItem>
        <MenuItem value="my">Burmese</MenuItem>
        <MenuItem value="km">Khmer</MenuItem>
        <MenuItem value="lo">Lao</MenuItem>
        <MenuItem value="mn">Mongolian</MenuItem>
        <MenuItem value="hy">Armenian</MenuItem>
        <MenuItem value="az">Azerbaijani</MenuItem>
        <MenuItem value="kk">Kazakh</MenuItem>
        <MenuItem value="uz">Uzbek</MenuItem>
        <MenuItem value="tg">Tajik</MenuItem>
        <MenuItem value="ky">Kyrgyz</MenuItem>
        <MenuItem value="tk">Turkmen</MenuItem>
        <MenuItem value="ps">Pashto</MenuItem>
        <MenuItem value="sd">Sindhi</MenuItem>
        <MenuItem value="ha">Hausa</MenuItem>
        <MenuItem value="ig">Igbo</MenuItem>
        <MenuItem value="so">Somali</MenuItem>
        <MenuItem value="om">Oromo</MenuItem>
        <MenuItem value="ti">Tigrinya</MenuItem>
        <MenuItem value="rw">Kinyarwanda</MenuItem>
        <MenuItem value="ln">Lingala</MenuItem>
        <MenuItem value="mg">Malagasy</MenuItem>
        <MenuItem value="sn">Shona</MenuItem>
        <MenuItem value="xh">Xhosa</MenuItem>
        <MenuItem value="st">Sesotho</MenuItem>
        <MenuItem value="tn">Tswana</MenuItem>
        <MenuItem value="ve">Venda</MenuItem>
        <MenuItem value="ts">Tsonga</MenuItem>
        <MenuItem value="ny">Chichewa</MenuItem>
        <MenuItem value="aa">Afar</MenuItem>
        <MenuItem value="ab">Abkhazian</MenuItem>
        <MenuItem value="ae">Avestan</MenuItem>
        <MenuItem value="ak">Akan</MenuItem>
        <MenuItem value="an">Aragonese</MenuItem>
        <MenuItem value="as">Assamese</MenuItem>
        <MenuItem value="av">Avaric</MenuItem>
        <MenuItem value="ay">Aymara</MenuItem>
        <MenuItem value="ba">Bashkir</MenuItem>
        <MenuItem value="be">Belarusian</MenuItem>
        <MenuItem value="bi">Bislama</MenuItem>
        <MenuItem value="bm">Bambara</MenuItem>
        <MenuItem value="bo">Tibetan</MenuItem>
        <MenuItem value="br">Breton</MenuItem>
        <MenuItem value="ce">Chechen</MenuItem>
        <MenuItem value="ch">Chamorro</MenuItem>
        <MenuItem value="co">Corsican</MenuItem>
        <MenuItem value="cr">Cree</MenuItem>
        <MenuItem value="cu">Church Slavic</MenuItem>
        <MenuItem value="cv">Chuvash</MenuItem>
        <MenuItem value="cy">Welsh</MenuItem>
        <MenuItem value="dv">Divehi</MenuItem>
        <MenuItem value="dz">Dzongkha</MenuItem>
        <MenuItem value="ee">Ewe</MenuItem>
        <MenuItem value="eo">Esperanto</MenuItem>
        <MenuItem value="ff">Fulah</MenuItem>
        <MenuItem value="fj">Fijian</MenuItem>
        <MenuItem value="fo">Faroese</MenuItem>
        <MenuItem value="ga">Irish</MenuItem>
        <MenuItem value="gd">Scottish Gaelic</MenuItem>
        <MenuItem value="gn">Guarani</MenuItem>
        <MenuItem value="gv">Manx</MenuItem>
        <MenuItem value="ht">Haitian Creole</MenuItem>
        <MenuItem value="hz">Herero</MenuItem>
        <MenuItem value="ia">Interlingua</MenuItem>
        <MenuItem value="ie">Interlingue</MenuItem>
        <MenuItem value="ik">Inupiaq</MenuItem>
        <MenuItem value="io">Ido</MenuItem>
        <MenuItem value="iu">Inuktitut</MenuItem>
        <MenuItem value="jv">Javanese</MenuItem>
        <MenuItem value="kg">Kongo</MenuItem>
        <MenuItem value="ki">Kikuyu</MenuItem>
        <MenuItem value="kj">Kuanyama</MenuItem>
        <MenuItem value="kl">Kalaallisut</MenuItem>
        <MenuItem value="kr">Kanuri</MenuItem>
        <MenuItem value="ks">Kashmiri</MenuItem>
        <MenuItem value="ku">Kurdish</MenuItem>
        <MenuItem value="kv">Komi</MenuItem>
        <MenuItem value="kw">Cornish</MenuItem>
        <MenuItem value="lb">Luxembourgish</MenuItem>
        <MenuItem value="lg">Ganda</MenuItem>
        <MenuItem value="li">Limburgan</MenuItem>
        <MenuItem value="lu">Luba-Katanga</MenuItem>
        <MenuItem value="mh">Marshallese</MenuItem>
        <MenuItem value="mi">Maori</MenuItem>
        <MenuItem value="ml">Malayalam</MenuItem>
        <MenuItem value="mo">Moldavian</MenuItem>
        <MenuItem value="na">Nauru</MenuItem>
        <MenuItem value="nd">North Ndebele</MenuItem>
        <MenuItem value="ng">Ndonga</MenuItem>
        <MenuItem value="nr">South Ndebele</MenuItem>
        <MenuItem value="nv">Navajo</MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;
