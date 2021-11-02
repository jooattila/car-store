exports.checkLiterals = (request, field) => {
  const validLiteral = new RegExp(/[A-Z][a-z]*/);
  return  (request.body.brand !== '' && validLiteral.test(field));
};

exports.checkSearchLiterals = (field) => {
  const validLiteral = new RegExp(/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/);
  return (field !== '' && validLiteral.test(field));
};

exports.checkUsername = (request) => {
  const validLiteral = new RegExp(/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/);
  return (request.body.brand !== '' && validLiteral.test(request.body.username));
};

exports.checkIntegers = (field)  => {
  const validInteger = new RegExp(/^[0-9]*$/);
  return (field !== '' && validInteger.test(field));
};
