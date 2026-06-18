export function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const role = String(req.user.role || '').toLowerCase().trim();
  if (role !== 'admin' && role !== 'owner_admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  next();
}

export function isTeacher(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const role = String(req.user.role || '').toLowerCase().trim();
  if (role !== 'teacher' && role !== 'admin' && role !== 'owner_admin') {
    return res.status(403).json({ error: 'Access denied. Teacher or Admin only.' });
  }

  next();
}

export function isAuthenticated(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}
