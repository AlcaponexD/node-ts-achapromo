export default {
  string_to_number: function (string: string) {
    return string.replace(/[^0-9]/g, '');
  },
};
