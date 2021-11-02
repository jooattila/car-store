
// middleware az engedélyezéshez
exports.authorize = (roles = ['user', 'admin']) => (req, res, next) => {
  if (!req.session.role) {
    res.status(401).send('You are not logged in');
  } else if (!roles.includes(req.session.role)) {
    res.status(401).send('You do not have permission to access this endpoint');
  } else {
    next();
  }
};
