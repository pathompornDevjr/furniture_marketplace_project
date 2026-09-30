const extractToken = ({ headers, request, cookie }) => {
  const authHeader =
    headers?.authorization ||
    headers?.Authorization ||
    (request?.headers ? request.headers.get("authorization") : null);

  if (authHeader && typeof authHeader === "string") {
    return authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader.trim();
  }

  return cookie?.token?.value?.split(" ")[0] || null;
};

export const middleware = {
  auth: async ({ jwt, set, cookie, store, headers, request }) => {
    const token = extractToken({ headers, request, cookie });
    // token not found
    if (!token) {
      set.status = 401;
      throw new Error("token not found!");
    }

    // verify token
    const user = await jwt.verify(token);
    if (!user) {
      set.status = 401;
      throw new Error("invalid token!");
    }

    store.user = user;
  },
  auth_admin: async ({ jwt, set, cookie, store, headers, request }) => {
    const token = extractToken({ headers, request, cookie });
    // token not found
    if (!token) {
      set.status = 401;
      throw new Error("token not found!");
    }

    // verify token
    const user = await jwt.verify(token);
    if (!user) {
      set.status = 401;
      throw new Error("invalid token!");
    }

    if (Number(user.roleId) !== 1) {
      set.status = 401;
      throw new Error("invalid admin");
    }

    store.user = user;
  },
};
