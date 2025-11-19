import { NextResponse } from "next/server";
import { getTrackDb } from "../../lib/db/trackDb";
import { EventModel } from "../../models/Event";
import { ProductSchema } from "../../models/Product";
import mongoose from "mongoose";

const METRIC_MAP = {
  PRODUCT_VIEW: async (event, conn) => {
    const Product = conn.models.Product || conn.model("Product", ProductSchema);
    await Product.findByIdAndUpdate(event.productId, {
      $inc: { views: 1 },
      $set: { lastViewedAt: new Date() }
    });
  },
  ADD_TO_CART: async (event, conn) => {
    const Product = conn.models.Product || conn.model("Product", ProductSchema);
    await Product.findByIdAndUpdate(event.productId, { $inc: { cartCount: 1 } });
  },
  REMOVE_FROM_CART: async (event, conn) => {
    // Optionally decrement cartCount
  },
  ADD_TO_WISHLIST: async (event, conn) => {
    const Product = conn.models.Product || conn.model("Product", ProductSchema);
    await Product.findByIdAndUpdate(event.productId, { $inc: { wishlistCount: 1 } });
  },
  REMOVE_FROM_WISHLIST: async (event, conn) => {
    // Optionally decrement wishlistCount
  },
  ORDER_PLACED: async (event, conn) => {
    const Product = conn.models.Product || conn.model("Product", ProductSchema);
    if (Array.isArray(event.productIds)) {
      await Product.updateMany(
        { _id: { $in: event.productIds } },
        { $inc: { purchaseCount: 1 }, $set: { lastPurchasedAt: new Date() } }
      );
    }
  },
  CHECKOUT_ABANDONED: async (event, conn) => {
    const Product = conn.models.Product || conn.model("Product", ProductSchema);
    if (Array.isArray(event.productIds)) {
      await Product.updateMany(
        { _id: { $in: event.productIds } },
        { $inc: { abandonedCount: 1 } }
      );
    }
  },
  SEARCH: async (event, conn) => {
    const Product = conn.models.Product || conn.model("Product", ProductSchema);
    if (Array.isArray(event.productIds)) {
      await Product.updateMany(
        { _id: { $in: event.productIds } },
        { $inc: { searchAppearances: 1 } }
      );
    }
  },
  // ...other event types...
};

function waitForConnection(conn, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    if (conn.readyState === 1) return resolve();
    const timer = setTimeout(() => reject(new Error("DB not connected in time")), timeoutMs);
    conn.once("connected", () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    let conn;
    try {
      conn = await getTrackDb(undefined, 8000); // 8s timeout
      await waitForConnection(conn, 8000); // Ensure connection is ready
    } catch (dbErr) {
      return NextResponse.json(
        { success: false, error: "Database connection failed: " + dbErr.message },
        { status: 500 }
      );
    }

    // Use native collection to avoid mongoose buffering on default connection
    const eventsColl = conn.db.collection("events");

    // Batch event support
    if (Array.isArray(body.batch)) {
      const eventsData = body.batch.map((evt) => {
        let eventData = { ...evt, timestamp: new Date() };
        if (evt.user && typeof evt.user === "object") {
          eventData.userId = evt.user._id;
          eventData.userInfo = { ...evt.user };
        }
        return eventData;
      });
      try {
        await eventsColl.insertMany(eventsData, {
          writeConcern: { w: 1 },
          maxTimeMS: 8000,
          ordered: false, // allow partial success
        });
      } catch (insertErr) {
        //consolle.error("Batch insert error:", insertErr);
        return NextResponse.json(
          { success: false, error: "Batch insert failed: " + insertErr.message },
          { status: 500 }
        );
      }

      for (const evt of body.batch) {
        if (METRIC_MAP[evt.type]) {
          await METRIC_MAP[evt.type](evt, conn);
        }
      }
      return NextResponse.json({ success: true });
    }

    // Single event (legacy) - use native insertOne to avoid buffering
    let eventData = { ...body, timestamp: new Date() };
    if (body.user && typeof body.user === "object") {
      eventData.userId = body.user._id;
      eventData.userInfo = { ...body.user };
    }

    try {
      await eventsColl.insertOne(eventData, { writeConcern: { w: 1 }, maxTimeMS: 8000 });
    } catch (singleInsertErr) {
      //consolle.error("Single insert error:", singleInsertErr);
      return NextResponse.json(
        { success: false, error: "Event insert failed: " + singleInsertErr.message },
        { status: 500 }
      );
    }

    if (METRIC_MAP[body.type]) {
      await METRIC_MAP[body.type](body, conn);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// export async function GET(req) {
//   try {
//     const url = new URL(req.url);
  

//     let conn;
//     try {
//       conn = await getTrackDb(undefined, 8000);
//       await waitForConnection(conn, 8000);
//     } catch (dbErr) {
//       return NextResponse.json(
//         { success: false, error: "Database connection failed: " + dbErr.message },
//         { status: 500 }
//       );
//     }

//     const eventsColl = conn.db.collection("events");

//     // Build filter from query params
//     const filter = {};
//     const type = url.searchParams.get("type");
//     const productId = url.searchParams.get("productId");
//     const userId = url.searchParams.get("userId");
//     const since = url.searchParams.get("since"); // ISO date
//     const limit = Math.min(1000, parseInt(url.searchParams.get("limit") || "200", 10));
//     const sortParam = url.searchParams.get("sort") || "-timestamp";
//     if (type) filter.type = type;
//     if (productId) {
//       try {
//         filter.productId = mongoose.Types.ObjectId.isValid(productId)
//           ? mongoose.Types.ObjectId(productId)
//           : productId;
//       } catch (e) {
//         filter.productId = productId;
//       }
//     }
//     if (userId) filter.userId = userId;
//     if (since) {
//       const d = new Date(since);
//       if (!isNaN(d.getTime())) filter.timestamp = { $gte: d };
//     }

//     const sort = sortParam.startsWith("-")
//       ? { [sortParam.slice(1)]: -1 }
//       : { [sortParam]: 1 };

//     const events = await eventsColl.find(filter).sort(sort).limit(limit).toArray();

//     // If userId provided, also fetch user document and addresses (best-effort)
//     let userDoc = null;
//     let addresses = [];
//     if (userId) {
//       try {
//         const usersColl = conn.db.collection("users");
//         if (mongoose.Types.ObjectId.isValid(userId)) {
//           userDoc = await usersColl.findOne({ _id: mongoose.Types.ObjectId(userId) });
//         } else {
//           userDoc = await usersColl.findOne({ _id: userId }) || await usersColl.findOne({ email: userId }) || null;
//         }
//       } catch (e) {
//         // non-blocking: don't fail the whole request if user lookup fails
//         userDoc = null;
//       }

//       try {
//         const addressesColl = conn.db.collection("addresses");
//         if (mongoose.Types.ObjectId.isValid(userId)) {
//           addresses = await addressesColl.find({ userId: mongoose.Types.ObjectId(userId) }).toArray();
//         } else {
//           addresses = await addressesColl.find({ userId }).toArray();
//         }
//       } catch (e) {
//         addresses = [];
//       }
//     }

//     return NextResponse.json({ success: true, count: events.length, events, user: userDoc, addresses });
//   } catch (err) {
//     return NextResponse.json({ success: false, error: err.message }, { status: 500 });
//   }
// }


export async function GET(req) {
  try {
    const url = new URL(req.url);
  
    let conn;
    try {
      conn = await getTrackDb(undefined, 8000);
      await waitForConnection(conn, 8000);
    } catch (dbErr) {
      return NextResponse.json(
        { success: false, error: "Database connection failed: " + dbErr.message },
        { status: 500 }
      );
    }

    const eventsColl = conn.db.collection("events");

    // Build filter from query params
    const filter = {};
    const type = url.searchParams.get("type");
    const productId = url.searchParams.get("productId");
    const userId = url.searchParams.get("userId");
    const since = url.searchParams.get("since");
    const limit = Math.min(1000, parseInt(url.searchParams.get("limit") || "200", 10));
    const sortParam = url.searchParams.get("sort") || "-timestamp";
    
    if (type) filter.type = type;
    if (productId) {
      try {
        filter.productId = mongoose.Types.ObjectId.isValid(productId)
          ? new mongoose.Types.ObjectId(productId)
          : productId;
      } catch (e) {
        filter.productId = productId;
      }
    }
    if (userId) filter.userId = userId;
    if (since) {
      const d = new Date(since);
      if (!isNaN(d.getTime())) filter.timestamp = { $gte: d };
    }

    const sort = sortParam.startsWith("-")
      ? { [sortParam.slice(1)]: -1 }
      : { [sortParam]: 1 };

    const events = await eventsColl.find(filter).sort(sort).limit(limit).toArray();

    // Populate products for events (only name and variant)
    const productsColl = conn.db.collection("products");
    const productIds = [...new Set(
      events
        .map(e => e.productId)
        .filter(id => id != null)
    )];

    let productsMap = {};
    if (productIds.length > 0) {
      const products = await productsColl.find(
        {
          _id: { $in: productIds.map(id => 
            mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
          )}
        },
        {
          projection: { name: 1, variant: 1, slug: 1 } // Only fetch name and variant fields
        }
      ).toArray();
      
      productsMap = products.reduce((acc, product) => {
        acc[product._id.toString()] = {
          name: product.name,
          variant: product.variant
        };
        return acc;
      }, {});
    }

    // Add populated product to each event
    const populatedEvents = events.map(event => ({
      ...event,
      product: event.productId ? (productsMap[event.productId.toString()] || null) : null
    }));

    // If userId provided, fetch user document and addresses
    let userDoc = null;
    let addresses = [];
    
    if (userId) {
      try {
        const usersColl = conn.db.collection("users");
        const userIdToQuery = mongoose.Types.ObjectId.isValid(userId) 
          ? new mongoose.Types.ObjectId(userId)
          : userId;
        
        userDoc = await usersColl.findOne({ _id: userIdToQuery });
        
        if (!userDoc && typeof userId === 'string') {
          userDoc = await usersColl.findOne({ email: userId });
        }
      } catch (e) {
        console.error('User lookup error:', e);
        userDoc = null;
      }

      // Fetch addresses using the Address model structure
      try {
        const addressesColl = conn.db.collection("addresses");
        const userIdToQuery = mongoose.Types.ObjectId.isValid(userId) 
          ? new mongoose.Types.ObjectId(userId)
          : userId;
        
        // Query for active addresses (not soft-deleted)
        addresses = await addressesColl.find({ 
          user: userIdToQuery,
          deletedAt: null 
        })
        .sort({ isDefault: -1, createdAt: -1 })
        .toArray();
      } catch (e) {
        console.error('Address lookup error:', e);
        addresses = [];
      }
    }

    return NextResponse.json({ 
      success: true, 
      count: populatedEvents.length, 
      events: populatedEvents, 
      user: userDoc, 
      addresses 
    });
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}