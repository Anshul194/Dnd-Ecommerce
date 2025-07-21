import jwt from 'jsonwebtoken';

export const Token = {
  generateTokens(user) {
    const payload = {
      id: user._id.toString(),
      isSuperAdmin: user.isSuperAdmin,
      tenantId: user.tenant || null,
      role: user.role || null
    };

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m'  // Short-lived Access Token
    });

    const refreshToken = jwt.sign({ id: user._id.toString() }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '7d'  // Longer-lived Refresh Token
    });

    return { accessToken, refreshToken };
  },

  setTokensCookies(res, accessToken, refreshToken) {
    res.headers.append('Set-Cookie', `accessToken=${accessToken}; Path=/; HttpOnly; Max-Age=900; SameSite=Strict; Secure`);
    res.headers.append('Set-Cookie', `refreshToken=${refreshToken}; Path=/; HttpOnly; Max-Age=604800; SameSite=Strict; Secure`);
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
  }
};
