module.exports = ({ meta, config, managers }, allowedRoles = []) => {
    return ({ req, res, next }) => {
      const tokenPayload = req.__longToken; 
      if (!tokenPayload?.role) {
        return managers.responseDispatcher.dispatch(res, {
          ok: false, code: 401, errors: 'Unauthorized - missing role'
        });
      }
      if (!allowedRoles.includes(tokenPayload.role)) {
        return managers.responseDispatcher.dispatch(res, {
          ok: false, code: 403, errors: 'Forbidden - insufficient role'
        });
      }
      next(tokenPayload);
    };
  };
  