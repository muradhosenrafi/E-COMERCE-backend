const passwordRegex = (password) => {
  if (/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password)) {
    return true;
  }
  return false;
};

export default passwordRegex;