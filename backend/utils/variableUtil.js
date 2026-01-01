function checkNullStringValue(value) {
  return value !== null && value !== undefined && value !== '';
}

module.exports = {
  checkNullStringValue,
};
