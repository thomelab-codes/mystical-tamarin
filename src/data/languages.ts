export interface VocabularyItem {
  word: string;
  translation: string;
  pronunciation?: string;
  category: string;
}

export interface LanguageData {
  name: string;
  code: string;
  flag: string;
  vocabulary: VocabularyItem[];
  phrases: { phrase: string; translation: string; pronunciation?: string }[];
}

export const SPANISH: LanguageData = {
  name: 'Spanish',
  code: 'es',
  flag: '🇪🇸',
  vocabulary: [
    // Greetings
    { word: 'Hola', translation: 'Hello', pronunciation: 'OH-lah', category: 'greetings' },
    { word: 'Adiós', translation: 'Goodbye', pronunciation: 'ah-DYOHS', category: 'greetings' },
    { word: 'Buenos días', translation: 'Good morning', pronunciation: 'BWEH-nohs DEE-ahs', category: 'greetings' },
    { word: 'Buenas tardes', translation: 'Good afternoon', pronunciation: 'BWEH-nahs TAR-des', category: 'greetings' },
    { word: 'Buenas noches', translation: 'Good evening/night', pronunciation: 'BWEH-nahs NOH-ches', category: 'greetings' },
    { word: 'Por favor', translation: 'Please', pronunciation: 'por fah-VOR', category: 'greetings' },
    { word: 'Gracias', translation: 'Thank you', pronunciation: 'GRAH-syahs', category: 'greetings' },
    { word: 'De nada', translation: "You're welcome", pronunciation: 'deh NAH-dah', category: 'greetings' },

    // Numbers
    { word: 'Uno', translation: 'One', pronunciation: 'OO-noh', category: 'numbers' },
    { word: 'Dos', translation: 'Two', pronunciation: 'dohs', category: 'numbers' },
    { word: 'Tres', translation: 'Three', pronunciation: 'trehs', category: 'numbers' },
    { word: 'Cuatro', translation: 'Four', pronunciation: 'KWAH-troh', category: 'numbers' },
    { word: 'Cinco', translation: 'Five', pronunciation: 'SEEN-koh', category: 'numbers' },
    { word: 'Seis', translation: 'Six', pronunciation: 'says', category: 'numbers' },
    { word: 'Siete', translation: 'Seven', pronunciation: 'SYEH-teh', category: 'numbers' },
    { word: 'Ocho', translation: 'Eight', pronunciation: 'OH-choh', category: 'numbers' },
    { word: 'Nueve', translation: 'Nine', pronunciation: 'NWEH-veh', category: 'numbers' },
    { word: 'Diez', translation: 'Ten', pronunciation: 'dyehs', category: 'numbers' },

    // Common Words
    { word: 'Sí', translation: 'Yes', pronunciation: 'see', category: 'common' },
    { word: 'No', translation: 'No', pronunciation: 'noh', category: 'common' },
    { word: 'Agua', translation: 'Water', pronunciation: 'AH-gwah', category: 'common' },
    { word: 'Comida', translation: 'Food', pronunciation: 'koh-MEE-dah', category: 'common' },
    { word: 'Casa', translation: 'House', pronunciation: 'KAH-sah', category: 'common' },
    { word: 'Familia', translation: 'Family', pronunciation: 'fah-MEE-lyah', category: 'common' },
    { word: 'Amigo', translation: 'Friend (male)', pronunciation: 'ah-MEE-goh', category: 'common' },
    { word: 'Amiga', translation: 'Friend (female)', pronunciation: 'ah-MEE-gah', category: 'common' },
    { word: 'Trabajo', translation: 'Work', pronunciation: 'trah-BAH-hoh', category: 'common' },
    { word: 'Tiempo', translation: 'Time/Weather', pronunciation: 'TYEM-poh', category: 'common' },

    // Colors
    { word: 'Rojo', translation: 'Red', pronunciation: 'ROH-hoh', category: 'colors' },
    { word: 'Azul', translation: 'Blue', pronunciation: 'ah-SOOL', category: 'colors' },
    { word: 'Verde', translation: 'Green', pronunciation: 'VER-deh', category: 'colors' },
    { word: 'Amarillo', translation: 'Yellow', pronunciation: 'ah-mah-REE-yoh', category: 'colors' },
    { word: 'Negro', translation: 'Black', pronunciation: 'NEH-groh', category: 'colors' },
    { word: 'Blanco', translation: 'White', pronunciation: 'BLAHN-koh', category: 'colors' },
  ],
  phrases: [
    { phrase: '¿Cómo estás?', translation: 'How are you?', pronunciation: 'KOH-moh es-TAHS' },
    { phrase: 'Me llamo...', translation: 'My name is...', pronunciation: 'meh YAH-moh' },
    { phrase: '¿Cuánto cuesta?', translation: 'How much does it cost?', pronunciation: 'KWAN-toh KWES-tah' },
    { phrase: 'No entiendo', translation: "I don't understand", pronunciation: 'noh en-TYEN-doh' },
    { phrase: '¿Hablas inglés?', translation: 'Do you speak English?', pronunciation: 'AH-blahs een-GLES' },
    { phrase: 'Lo siento', translation: "I'm sorry", pronunciation: 'loh SYEN-toh' },
  ],
};

export const LITHUANIAN: LanguageData = {
  name: 'Lithuanian',
  code: 'lt',
  flag: '🇱🇹',
  vocabulary: [
    // Greetings
    { word: 'Labas', translation: 'Hello', pronunciation: 'lah-BAHS', category: 'greetings' },
    { word: 'Iki', translation: 'Bye', pronunciation: 'EE-kee', category: 'greetings' },
    { word: 'Labas rytas', translation: 'Good morning', pronunciation: 'lah-BAHS ree-TAHS', category: 'greetings' },
    { word: 'Labas vakaras', translation: 'Good evening', pronunciation: 'lah-BAHS vah-kah-RAHS', category: 'greetings' },
    { word: 'Labanakt', translation: 'Good night', pronunciation: 'lah-bah-NAHKT', category: 'greetings' },
    { word: 'Prašau', translation: 'Please', pronunciation: 'prah-SHOW', category: 'greetings' },
    { word: 'Ačiū', translation: 'Thank you', pronunciation: 'ah-CHOO', category: 'greetings' },
    { word: 'Prašom', translation: "You're welcome", pronunciation: 'prah-SHOM', category: 'greetings' },
    { word: 'Atsiprašau', translation: 'Sorry/Excuse me', pronunciation: 'aht-see-prah-SHOW', category: 'greetings' },

    // Numbers
    { word: 'Vienas', translation: 'One', pronunciation: 'vye-NAHS', category: 'numbers' },
    { word: 'Du', translation: 'Two', pronunciation: 'doo', category: 'numbers' },
    { word: 'Trys', translation: 'Three', pronunciation: 'trees', category: 'numbers' },
    { word: 'Keturi', translation: 'Four', pronunciation: 'keh-too-REE', category: 'numbers' },
    { word: 'Penki', translation: 'Five', pronunciation: 'pehn-KEE', category: 'numbers' },
    { word: 'Šeši', translation: 'Six', pronunciation: 'sheh-SHEE', category: 'numbers' },
    { word: 'Septyni', translation: 'Seven', pronunciation: 'sehp-tee-NEE', category: 'numbers' },
    { word: 'Aštuoni', translation: 'Eight', pronunciation: 'ahsh-twoh-NEE', category: 'numbers' },
    { word: 'Devyni', translation: 'Nine', pronunciation: 'deh-vee-NEE', category: 'numbers' },
    { word: 'Dešimt', translation: 'Ten', pronunciation: 'deh-SHIMT', category: 'numbers' },

    // Common Words
    { word: 'Taip', translation: 'Yes', pronunciation: 'type', category: 'common' },
    { word: 'Ne', translation: 'No', pronunciation: 'neh', category: 'common' },
    { word: 'Vanduo', translation: 'Water', pronunciation: 'vahn-DWO', category: 'common' },
    { word: 'Maistas', translation: 'Food', pronunciation: 'my-STAHS', category: 'common' },
    { word: 'Namai', translation: 'Home', pronunciation: 'nah-MY', category: 'common' },
    { word: 'Šeima', translation: 'Family', pronunciation: 'shay-MAH', category: 'common' },
    { word: 'Draugas', translation: 'Friend', pronunciation: 'DROW-gahs', category: 'common' },
    { word: 'Darbas', translation: 'Work', pronunciation: 'dahr-BAHS', category: 'common' },
    { word: 'Laikas', translation: 'Time', pronunciation: 'ly-KAHS', category: 'common' },
    { word: 'Pinigai', translation: 'Money', pronunciation: 'pee-nee-GY', category: 'common' },

    // Colors
    { word: 'Raudona', translation: 'Red', pronunciation: 'row-doh-NAH', category: 'colors' },
    { word: 'Mėlyna', translation: 'Blue', pronunciation: 'meh-lee-NAH', category: 'colors' },
    { word: 'Žalia', translation: 'Green', pronunciation: 'zhah-LYAH', category: 'colors' },
    { word: 'Geltona', translation: 'Yellow', pronunciation: 'gehl-toh-NAH', category: 'colors' },
    { word: 'Juoda', translation: 'Black', pronunciation: 'YWO-dah', category: 'colors' },
    { word: 'Balta', translation: 'White', pronunciation: 'bahl-TAH', category: 'colors' },
  ],
  phrases: [
    { phrase: 'Kaip laikaisi?', translation: 'How are you?', pronunciation: 'kyp ly-ky-SEE' },
    { phrase: 'Aš esu...', translation: 'I am...', pronunciation: 'ahsh eh-SOO' },
    { phrase: 'Kiek kainuoja?', translation: 'How much does it cost?', pronunciation: 'kyek ky-NWO-yah' },
    { phrase: 'Nesuprantu', translation: "I don't understand", pronunciation: 'neh-soo-prahn-TOO' },
    { phrase: 'Ar kalbate angliškai?', translation: 'Do you speak English?', pronunciation: 'ahr kahl-BAH-teh ahn-gleesh-KY' },
    { phrase: 'Malonu susipažinti', translation: 'Nice to meet you', pronunciation: 'mah-loh-NOO soo-see-pah-ZHEEN-tee' },
  ],
};

export const POLISH: LanguageData = {
  name: 'Polish',
  code: 'pl',
  flag: '🇵🇱',
  vocabulary: [
    // Greetings
    { word: 'Cześć', translation: 'Hello/Hi', pronunciation: 'cheshch', category: 'greetings' },
    { word: 'Do widzenia', translation: 'Goodbye', pronunciation: 'doh vee-DZEN-yah', category: 'greetings' },
    { word: 'Dzień dobry', translation: 'Good morning/day', pronunciation: 'jen DOH-bri', category: 'greetings' },
    { word: 'Dobry wieczór', translation: 'Good evening', pronunciation: 'DOH-bri VYEH-choor', category: 'greetings' },
    { word: 'Dobranoc', translation: 'Good night', pronunciation: 'doh-BRAH-nots', category: 'greetings' },
    { word: 'Proszę', translation: 'Please', pronunciation: 'PROH-sheh', category: 'greetings' },
    { word: 'Dziękuję', translation: 'Thank you', pronunciation: 'jen-KOO-yeh', category: 'greetings' },
    { word: 'Nie ma za co', translation: "You're welcome", pronunciation: 'nyeh mah zah tsoh', category: 'greetings' },
    { word: 'Przepraszam', translation: 'Sorry/Excuse me', pronunciation: 'psheh-PRAH-shahm', category: 'greetings' },

    // Numbers
    { word: 'Jeden', translation: 'One', pronunciation: 'YEH-den', category: 'numbers' },
    { word: 'Dwa', translation: 'Two', pronunciation: 'dvah', category: 'numbers' },
    { word: 'Trzy', translation: 'Three', pronunciation: 'tshi', category: 'numbers' },
    { word: 'Cztery', translation: 'Four', pronunciation: 'CHTE-ri', category: 'numbers' },
    { word: 'Pięć', translation: 'Five', pronunciation: 'pyench', category: 'numbers' },
    { word: 'Sześć', translation: 'Six', pronunciation: 'sheshch', category: 'numbers' },
    { word: 'Siedem', translation: 'Seven', pronunciation: 'SHEH-dem', category: 'numbers' },
    { word: 'Osiem', translation: 'Eight', pronunciation: 'OH-shem', category: 'numbers' },
    { word: 'Dziewięć', translation: 'Nine', pronunciation: 'DJEH-vyench', category: 'numbers' },
    { word: 'Dziesięć', translation: 'Ten', pronunciation: 'DJEH-shench', category: 'numbers' },

    // Common Words
    { word: 'Tak', translation: 'Yes', pronunciation: 'tahk', category: 'common' },
    { word: 'Nie', translation: 'No', pronunciation: 'nyeh', category: 'common' },
    { word: 'Woda', translation: 'Water', pronunciation: 'VOH-dah', category: 'common' },
    { word: 'Jedzenie', translation: 'Food', pronunciation: 'yeh-DZEN-yeh', category: 'common' },
    { word: 'Dom', translation: 'House/Home', pronunciation: 'dohm', category: 'common' },
    { word: 'Rodzina', translation: 'Family', pronunciation: 'roh-DJEE-nah', category: 'common' },
    { word: 'Przyjaciel', translation: 'Friend', pronunciation: 'pshi-YAH-chel', category: 'common' },
    { word: 'Praca', translation: 'Work', pronunciation: 'PRAH-tsah', category: 'common' },
    { word: 'Czas', translation: 'Time', pronunciation: 'chahs', category: 'common' },
    { word: 'Pieniądze', translation: 'Money', pronunciation: 'pyeh-NYON-dzeh', category: 'common' },

    // Colors
    { word: 'Czerwony', translation: 'Red', pronunciation: 'cher-VOH-ni', category: 'colors' },
    { word: 'Niebieski', translation: 'Blue', pronunciation: 'nyeh-BYEH-skee', category: 'colors' },
    { word: 'Zielony', translation: 'Green', pronunciation: 'zyeh-LOH-ni', category: 'colors' },
    { word: 'Żółty', translation: 'Yellow', pronunciation: 'ZHOO-ti', category: 'colors' },
    { word: 'Czarny', translation: 'Black', pronunciation: 'CHAR-ni', category: 'colors' },
    { word: 'Biały', translation: 'White', pronunciation: 'BYAH-wi', category: 'colors' },
  ],
  phrases: [
    { phrase: 'Jak się masz?', translation: 'How are you?', pronunciation: 'yahk sheh mahsh' },
    { phrase: 'Nazywam się...', translation: 'My name is...', pronunciation: 'nah-ZI-vahm sheh' },
    { phrase: 'Ile to kosztuje?', translation: 'How much does it cost?', pronunciation: 'EE-leh toh kohsh-TOO-yeh' },
    { phrase: 'Nie rozumiem', translation: "I don't understand", pronunciation: 'nyeh roh-ZOO-myem' },
    { phrase: 'Czy mówisz po angielsku?', translation: 'Do you speak English?', pronunciation: 'chi MOO-vish poh ahn-GYEL-skoo' },
    { phrase: 'Miło mi cię poznać', translation: 'Nice to meet you', pronunciation: 'MEE-woh mee chyeh POZ-nahch' },
  ],
};

export const LANGUAGES = [SPANISH, LITHUANIAN, POLISH];
