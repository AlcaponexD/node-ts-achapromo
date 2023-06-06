export default {
  string_to_number: function (string: string) {
    return string.replace(/[^0-9]/g, '');
  },
  slug: function (str: string): string {
    const map: { [key: string]: string } = {
      '-': ' ',
      a: 'á|à|ã|â|ä|À|Á|Ã|Â|Ä',
      e: 'é|è|ê|ë|É|È|Ê|Ë',
      i: 'í|ì|î|ï|Í|Ì|Î|Ï',
      o: 'ó|ò|õ|ô|ö|Ó|Ò|Õ|Ô|Ö',
      u: 'ú|ù|û|ü|Ú|Ù|Û|Ü',
      c: 'ç|Ç',
      n: 'ñ|Ñ',
    };

    for (const pattern in map) {
      str = str.replace(new RegExp(map[pattern], 'g'), pattern);
    }

    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-');
  },
};
