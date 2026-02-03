
export const safeParseUser = () => {
  try {
    const userJson = localStorage.getItem('adminUser');
    if (!userJson || userJson === 'undefined' || userJson === 'null') return null;
    return JSON.parse(userJson);
  } catch (e) {
    return null;
  }
};
