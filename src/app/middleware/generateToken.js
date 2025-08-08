import jwt from "jsonwebtoken";

export const Token = {
  generateTokens(user) {
    const payload = {
      id: user._id.toString(),
      isSuperAdmin: user.isSuperAdmin,
      tenantId: user.tenant || null,
      role: user.role || null,
    };

    // Calculate expiration times in seconds (JWT standard)
    const accessTokenExpInSeconds = Math.floor(Date.now() / 1000) + (30 * 60); // 30 minutes
    const refreshTokenExpInSeconds = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days

    // Add exp claim to payload for consistency
    const accessPayload = { ...payload, exp: accessTokenExpInSeconds };
    const refreshPayload = { id: user._id.toString(), exp: refreshTokenExpInSeconds };

    const accessToken = jwt.sign(accessPayload, process.env.ACCESS_TOKEN_SECRET);
    const refreshToken = jwt.sign(refreshPayload, process.env.REFRESH_TOKEN_SECRET);

    // Return expiration times in milliseconds for cookie setting
    const accessTokenExp = accessTokenExpInSeconds * 1000;
    const refreshTokenExp = refreshTokenExpInSeconds * 1000;

    return { 
      accessToken, 
      refreshToken, 
      accessTokenExp, 
      refreshTokenExp 
    };
  },

  setTokensCookies(res, accessToken, refreshToken, accessTokenExp, refreshTokenExp) {
    // Calculate remaining time in seconds, ensuring it's not negative
    const now = Date.now();
    const accessMaxAge = Math.max(0, Math.floor((accessTokenExp - now) / 1000));
    const refreshMaxAge = Math.max(0, Math.floor((refreshTokenExp - now) / 1000));

    // Only set cookies if there's remaining time
    if (accessMaxAge > 0) {
      res.headers.append(
        "Set-Cookie",
        `accessToken=${accessToken}; Path=/; HttpOnly; Max-Age=${accessMaxAge}; SameSite=Strict; Secure`
      );
    }
    
    if (refreshMaxAge > 0) {
      res.headers.append(
        "Set-Cookie",
        `refreshToken=${refreshToken}; Path=/; HttpOnly; Max-Age=${refreshMaxAge}; SameSite=Strict; Secure`
      );
    }
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
      console.error('Token verification failed:', err.message);
      return null;
    }
  },

  /**
   * Verify refresh token and return user ID if valid
   */
  async verifyRefreshToken(refreshToken) {
    try {
      if (!refreshToken) return null;
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      return decoded;
    } catch (err) {
      console.error('Refresh token verification failed:', err.message);
      return null;
    }
  },

  /**
   * Check if token is about to expire (within 5 minutes)
   */
  isTokenExpiringSoon(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return true;
      
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - now;
      
      // Return true if token expires within 5 minutes (300 seconds)
      return timeUntilExpiry < 300;
    } catch (err) {
      return true;
    }
  },
};
