const languages = {
  english: [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
    "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
    "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
    "an", "will", "my", "one", "all", "would", "there", "their", "what", "so"
  ],
  spanish: [
    "el", "la", "de", "que", "y", "en", "un", "ser", "se", "no",
    "haber", "por", "con", "su", "para", "como", "estar", "tener", "todo", "pero"
  ],
  french: [
    "le", "la", "de", "un", "être", "et", "à", "il", "avoir", "ne",
    "je", "son", "que", "se", "qui", "dans", "en", "ce", "pas", "pour"
  ],
  programming: [
    "function", "const", "let", "var", "return", "import", "export", "class", "async", "await",
    "try", "catch", "if", "else", "switch", "case", "default", "while", "for", "foreach"
  ]
};

export type Language = keyof typeof languages;

export const generateWords = (count: number = 25, lang: Language = 'english'): string => {
  const wordList = languages[lang] || languages.english;
  const result = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    result.push(wordList[randomIndex]);
  }
  return result.join(' ');
};
