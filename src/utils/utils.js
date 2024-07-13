// extract bibtex id from bibtex string
export const extractBibTeXId = (bibtex) => {
  const match = bibtex.match(/@\w+\{([^,]+),/);
  return match ? match[1] : null;
};

// replace bibtex id in bibtex string
export const replaceBibTeXId = (bibtex, newId) => {
  const noSpacesId = newId.replace(/\s+/g, '_');
  return bibtex.replace(
    /@\w+\{[^,]+,/,
    `@${bibtex.split("{")[0].slice(1)}{${noSpacesId},`
  );
};

// regex for finding cite commands in text
export const citeRegex = /\\cite{([^}]*)}/g;

// replace spaces with underscores in cite commands
export const updateCiteCommands = (text) => {
  return text.replace(citeRegex, (match, p1) => `\\cite{${p1.replace(/\s+/g, '_')}}`);
};