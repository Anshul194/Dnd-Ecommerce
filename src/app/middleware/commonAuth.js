// import jwt from 'jsonwebtoken';
// import Admin from '../models/admin.js';
// import User from '../models/User.js';
// import dbConnect from '../lib/mongodb.js';
// import initRedis from '../config/redis.js';
// import { NextResponse } from 'next/server';

// /**
//  * Common Authentication Middleware for Next.js API Routes
//  * Verifies token and checks user existence in specified table
//  */
// export async function verifyTokenAndUser(request, userType = 'admin') {
//   try {
//     // Connect to database
//     await dbConnect();
    
//     // Extract access token from Authorization header
//     const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
//     if (!accessToken) {
//       return {
//         error: NextResponse.json(
//           { success: false, message: 'Access token is required' },
//           { status: 401 }
//         )
//       };
//     }

//     // Verify token is valid in Redis
//     const redis = initRedis();
//     const tokenStatus = await redis.get(`accessToken:${accessToken}`);
//     console.log('[Auth] Token status from Redis:', tokenStatus);
    
//     if (!tokenStatus || tokenStatus !== 'valid') {
//       return {
//         error: NextResponse.json(
//           { success: false, message: 'Invalid or expired token' },
//           { status: 401 }
//         )
//       };
//     }

//     // Decode JWT token to get user information
//     let decoded;
//     try {
//       decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
//     } catch (jwtError) {
//       console.error('JWT Verification Error:', jwtError);
//       return {
//         error: NextResponse.json(
//           { success: false, message: 'Invalid token format' },
//           { status: 401 }
//         )
//       };
//     }

//     // Extract user ID from token
//     const userId = decoded.id || decoded.userId || decoded.sub;
//     console.log('[Auth] Extracted userId:', userId);
    
//     // if (!userId) {
//     //   return {
//     //     error: NextResponse.json(
//     //       { success: false, message: 'User ID not found in token' },
//     //       { status: 401 }
//     //     )
//     //   };
//     // }
//      if (!userId) {
//       console.log('[Auth] User ID not found in token');
//       return { error: NextResponse.json({ success: false, message: 'User ID not found in token' }, { status: 401 }) };
//     }

//     let user;
//     let userModel;
    
//     // Check user existence based on userType
//     if (userType === 'admin') {
//       user = await Admin.findById(userId).select('-password');
//       userModel = 'Admin';
//     } else if (userType === 'user') {
//       user = await User.findById(userId).select('-password');
//       userModel = 'User';
//     } else {
//        console.log('[Auth] Invalid user type specified:', userType);
//       return {
        
//         error: NextResponse.json(
//           { success: false, message: 'Invalid user type specified' },
//           { status: 500 }
//         )
//       };
//     }
    
//      console.log(`[Auth] Found user in ${userModel} collection:`, user);
//     if (!user) {
//       console.log(`[Auth] Access denied. ${userModel} not found.`);
//       return {
//         error: NextResponse.json(
//           { 
//             success: false, 
//             message: `Access denied. ${userModel} account not found.` 
//           },
//           { status: 403 }
//         )
//       };
//     }

//     // Optional: Check if account is active
//     if (user.status && user.status !== 'active') {
//       return {
//         error: NextResponse.json(
//           { success: false, message: `${userModel} account is inactive` },
//           { status: 403 }
//         )
//       };
//     }

//     // Optional: Check if account is deleted (soft delete)
//     if (user.isDeleted) {
//       return {
//         error: NextResponse.json(
//           { success: false, message: `${userModel} account has been deactivated` },
//           { status: 403 }
//         )
//       };
//     }

//     // Return user information
//      console.log('final [Auth] Authentication success for user:', {
//       id: user._id,
//       email: user.email,
//       name: user.name,
//       userType,
//       createdAt: user.createdAt,
//       lastLogin: user.lastLogin,
//       status: user.status
//     });
//     return {
//       user: {
//         id: user._id,
//         email: user.email,
//         name: user.name,
//         userType: userType,
//         createdAt: user.createdAt,
//         lastLogin: user.lastLogin,
//         status: user.status
//       }
//     };

//   } catch (error) {
//     console.error('Authentication error:', error);
//     return {
//       error: NextResponse.json(
//         { success: false, message: 'Server error during authentication' },
//         { status: 500 }
//       )
//     };
//   }
// }

// /**
//  * Admin-only middleware
//  * Specifically checks Admin table
//  */
// export async function verifyAdminAccess(request) {
//   return await verifyTokenAndUser(request, 'admin');
// }

// /**
//  * User-only middleware
//  * Specifically checks User table
//  */
// export async function verifyUserAccess(request) {
//   return await verifyTokenAndUser(request, 'user');
// }

// /**
//  * Flexible middleware that checks both tables
//  * Returns user info with userType indication
//  */
// export async function verifyAnyUserAccess(request) {
//   try {
//     // First try admin table
//     const adminResult = await verifyTokenAndUser(request, 'admin');
//     if (!adminResult.error) {
//       return {
//         user: {
//           ...adminResult.user,
//           userType: 'admin'
//         }
//       };
//     }

//     // If admin check failed, try user table
//     const userResult = await verifyTokenAndUser(request, 'user');
//     if (!userResult.error) {
//       return {
//         user: {
//           ...userResult.user,
//           userType: 'user'
//         }
//       };
//     }

//     // If both failed, return the admin error (more restrictive)
//     return adminResult;

//   } catch (error) {
//     console.error('Flexible authentication error:', error);
//     return {
//       error: NextResponse.json(
//         { success: false, message: 'Server error during authentication' },
//         { status: 500 }
//       )
//     };
//   }
// }

// /**
//  * Higher-order function for admin-only routes
//  */
// export function withAdminAuth(handler) {
//   return async function(request, ...args) {
//     const authResult = await verifyAdminAccess(request);
    
//     if (authResult.error) {
//       return authResult.error;
//     }

//     // Add admin info to request context
//     request.admin = authResult.user;
    
//     return handler(request, ...args);
//   };
// }

// /**
//  * Higher-order function for user-only routes
//  */
// export function withUserAuth(handler) {
//   return async function(request, ...args) {
//     const authResult = await verifyUserAccess(request);
    
//     if (authResult.error) {
//       return authResult.error;
//     }

//     // Add user info to request context
//     request.user = authResult.user;
    
//     return handler(request, ...args);
//   };
// }

// /**
//  * Higher-order function for routes accessible by both admin and user
//  */
// export function withAnyAuth(handler) {
//   return async function(request, ...args) {
//     const authResult = await verifyAnyUserAccess(request);
    
//     if (authResult.error) {
//       return authResult.error;
//     }

//     // Add user info to request context
//     if (authResult.user.userType === 'admin') {
//       request.admin = authResult.user;
//     } else {
//       request.user = authResult.user;
//     }
    
//     return handler(request, ...args);
//   };
// }

// /**
//  * Utility function to get user info from token without table restriction
//  * Useful for debugging or logging
//  */
// export async function getUserFromToken(accessToken) {
//   try {
//     if (!accessToken) return null;

//     const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
//     const userId = decoded.id || decoded.userId || decoded.sub;
    
//     if (!userId) return null;

//     await dbConnect();

//     // Try admin first
//     let user = await Admin.findById(userId).select('-password');
//     if (user) {
//       return { ...user.toObject(), userType: 'admin' };
//     }

//     // Try user table
//     user = await User.findById(userId).select('-password');
//     if (user) {
//       return { ...user.toObject(), userType: 'user' };
//     }

//     return null;
//   } catch (error) {
//     console.error('Error getting user from token:', error);
//     return null;
//   }
// }