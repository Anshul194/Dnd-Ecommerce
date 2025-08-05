import jwt from "jsonwebtoken";

export const Token = {
  generateTokens(user) {
    const payload = {
      id: user._id.toString(),
      isSuperAdmin: user.isSuperAdmin,
      tenantId: user.tenant || null,
      role: user.role || null,
    };

    const accessTokenExp = Date.now() + 30 * 60 * 1000; // 30 minutes
    const refreshTokenExp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "30m", // Short-lived Access Token
    });

    const refreshToken = jwt.sign(
      { id: user._id.toString() },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d", // Longer-lived Refresh Token
      }
    );

    return { 
      accessToken, 
      refreshToken, 
      accessTokenExp, 
      refreshTokenExp 
    };
  },

  setTokensCookies(res, accessToken, refreshToken, accessTokenExp, refreshTokenExp) {
    const accessMaxAge = Math.floor((accessTokenExp - Date.now()) / 1000);
    const refreshMaxAge = Math.floor((refreshTokenExp - Date.now()) / 1000);

    res.headers.append(
      "Set-Cookie",
      `accessToken=${accessToken}; Path=/; HttpOnly; Max-Age=${accessMaxAge}; SameSite=Strict; Secure`
    );
    res.headers.append(
      "Set-Cookie",
      `refreshToken=${refreshToken}; Path=/; HttpOnly; Max-Age=${refreshMaxAge}; SameSite=Strict; Secure`
    );
  },

  /**
   * Extract account info from access token (acc)
   * Returns user info if valid, otherwise null
   */
  async acc(accessToken) {
    try {
      if (!accessToken) return null;
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      // You may want to fetch user from DB here if needed
      return decoded;
    } catch (err) {
      return null;
    }
  },
};
