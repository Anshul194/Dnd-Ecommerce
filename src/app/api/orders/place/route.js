import { NextResponse } from "next/server";
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import OrderController from "../../../lib/controllers/orderController.js";
import OrderService from "../../../lib/services/orderService.js";
import OrderRepository from "../../../lib/repository/OrderRepository.js";
import CouponService from "../../../lib/services/CouponService.js";
import CouponRepository from "../../../lib/repository/CouponRepository.js";
import EmailService from "../../../lib/services/EmailService.js";
import WhatsappService from "../../../lib/services/WhatsappService.js";
import { OrderSchema } from "../../../lib/models/Order.js";
import { CouponSchema } from "../../../lib/models/Coupon.js";
import { ProductSchema } from "../../../lib/models/Product.js";
import { VariantSchema } from "../../../lib/models/Variant.js";
import { getSubdomain, getDbConnection } from "../../../lib/tenantDb";
import { getUserById, withUserAuth } from "../../../middleware/commonAuth.js";
import userSchema from "@/app/lib/models/User.js";
import UserService from "@/app/lib/services/userService.js";

export async function POST(req) {
  try {
    const tenant = req.headers.get("x-tenant");
    const body = await req.json();
    //consolle.log('Route received create order body:', JSON.stringify(body, null, 2));
    const subdomain = getSubdomain(req);
    //consolle.log('Subdomain:', subdomain);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      //consolle.error('No database connection established');
      return NextResponse.json(
        { success: false, message: "DB not found" },
        { status: 404 }
      );
    }
    //consolle.log('Connection name in route:', conn.name);
    const Order = conn.models.Order || conn.model("Order", OrderSchema);
    const Coupon = conn.models.Coupon || conn.model("Coupon", CouponSchema);
    const Product = conn.models.Product || conn.model("Product", ProductSchema);
    const Variant = conn.models.Variant || conn.model("Variant", VariantSchema);
    //consolle.log('Models registered:', { Order: Order.modelName, Coupon: Coupon.modelName, Product: Product.modelName, Variant: Variant.modelName });
    const orderRepo = new OrderRepository(Order, conn);
    const couponRepo = new CouponRepository(Coupon);
    const couponService = new CouponService(couponRepo);
    const emailService = new EmailService();
    const orderService = new OrderService(
      orderRepo,
      couponService,
      emailService
    );
    const orderController = new OrderController(orderService);
    const result = await orderController.create({ body }, conn, tenant);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    // Send WhatsApp notification after order placed (non-blocking)
    const whatsappService = new WhatsappService();
    console.log("result of order creation is: ", result);

    const userService = new UserService(conn);
    const user = await userService.getUserById(
      result.data.order.user.toString()
    );
    console.log("fetched user is ", user);
    result.data.userName = user?.name || "Customer";

    const payload = {
      phone: user.phone || user.phoneNumber || "",
      name: user.name || user.fullName || result.data.userName || "Customer",
      email: user.email || "",
      extraFields: {
        orderId: result.data.order._id.toString(),
        orderTotal: result.data.order.total.toString(),
        status: result.data.order.status,
      },
    };

    console.log();

    const orderItems = result.data.order.items || [];
    const productPromises = orderItems.map(async (item) => {
      // If item has a productId, fetch by id; otherwise try to find by product name as a fallback
      if (item.product) {
        return Product.findById(item.product)
          .lean()
          .exec()
          .catch((err) => {
            console.error("Failed to fetch product by id", item.product, err);
            return null;
          });
      } else if (item.product) {
        return Product.findOne({ _id: item.product })
          .lean()
          .exec()
          .catch((err) => {
            console.error("Failed to fetch product by name", item.product, err);
            return null;
          });
      } else {
        console.warn(
          "No productId or product name available for order item",
          item
        );
        return null;
      }
    });
    const products = await Promise.all(productPromises);
    console.log("products ===> ", products);
    products.forEach((product, index) => {
      const item = orderItems[index];
      payload.extraFields[`productName${index + 1}`] =
        product?.name || item?.product || "";
    });

    console.log("payload is ===> ", payload);
    const response = await whatsappService.sendWebhookRequest({ ...payload });
    console.log("api response ==> ",response);

    if (!response.success) {
      console.log("filed to send message on whatsapp");
      result.whatsappError = response.error;
    }

    // Generate invoice HTML file and save to public/uploads/invoices
    try {
      const order = result.data.order || {};
      const invoiceId = order._id ? order._id.toString() : `order-${Date.now()}`;
      const origin = (new URL(req.url)).origin;
      const invoicesDir = path.join(process.cwd(), "public", "uploads", "invoices");
      await fs.mkdir(invoicesDir, { recursive: true });

      const formatNumber = (v) => (v == null ? "" : Number(v).toFixed(2));

      // Compute GST / CGST / SGST rate values before building item rows
      const gstRateRaw = Number(order.gstRate ?? order.gst_rate ?? order.gst ?? 0);
      const cgstRateRaw = gstRateRaw ? gstRateRaw / 2 : (order.cgstRate || 0);
      const sgstRateRaw = gstRateRaw ? gstRateRaw / 2 : (order.sgstRate || 0);
      const cgstRate = formatNumber(cgstRateRaw);
      const sgstRate = formatNumber(sgstRateRaw);

      const items = (order.items || []).map((it, i) => {
        const name = it.name || it.product || "";
        const qty = Number(it.qty || it.quantity || it.count || 0);
        const rate = Number(it.rate || it.price || 0);
        const amount = Number(it.total ?? (qty && rate ? qty * rate : 0));
        const lineAmountRaw = amount;
        const lineTaxRaw = gstRateRaw ? (lineAmountRaw * gstRateRaw) / 100 : Number(it.taxAmount || 0);
        const cgstLine = lineTaxRaw / 2;
        const sgstLine = lineTaxRaw / 2;
        const lineTotal = lineAmountRaw + cgstLine + sgstLine;
        return `
          <tr class="item-row">
            <td class="center">${i + 1}</td>
            <td>${name}</td>
            <td class="center">${it.hsn || ''}</td>
            <td class="center">${qty}</td>
            <td class="right">${formatNumber(rate)}</td>
            <td class="right">${formatNumber(lineAmountRaw)}</td>
            <td class="center">${it.discountPercent || ''}</td>
            <td class="right">${formatNumber(it.discountAmount || 0)}</td>
            <td class="right">${formatNumber(lineAmountRaw)}</td>
            <td class="center">${cgstRate}</td>
            <td class="right">${formatNumber(cgstLine)}</td>
            <td class="center">${sgstRate}</td>
            <td class="right">${formatNumber(sgstLine)}</td>
            <td class="right">${formatNumber(lineTotal)}</td>
            <td class="right"></td>
          </tr>`;
        }).join('\n');

      const gstAmountRaw = Number(order.gstAmount ?? order.gst_amount ?? 0);
      const totalAfterTaxRaw = Number(order.total ?? 0);
      const totalBeforeTaxRaw = (gstAmountRaw && totalAfterTaxRaw) ? (totalAfterTaxRaw - gstAmountRaw) : (Number(order.subTotal ?? order.subtotal ?? 0));
      const totalBeforeTax = formatNumber(totalBeforeTaxRaw);

      const cgstAmountRaw = gstAmountRaw ? gstAmountRaw / 2 : Number(order.cgst || 0);
      const sgstAmountRaw = gstAmountRaw ? gstAmountRaw / 2 : Number(order.sgst || 0);
      const cgst = formatNumber(cgstAmountRaw);
      const sgst = formatNumber(sgstAmountRaw);
      const totalTax = formatNumber((cgstAmountRaw + sgstAmountRaw) || 0);
      const totalAfterTax = formatNumber(totalAfterTaxRaw || (Number(totalBeforeTaxRaw || 0) + Number(cgstAmountRaw + sgstAmountRaw || 0)));

      // Build billing and shipping address HTML from order data (prefer order addresses over user)
      const billing = order.billingAddress || {};
      const shipping = order.shippingAddress || {};
      const joinParts = (parts) => parts.filter(Boolean).join(', ');
      const billingAddressLine = joinParts([billing.addressLine1, billing.addressLine2, billing.city, billing.state, billing.postalCode, billing.country]);
      const shippingAddressLine = joinParts([shipping.addressLine1, shipping.addressLine2, shipping.city, shipping.state, shipping.postalCode, shipping.country]);

      const billingHtml = `\n                    <div><strong>Name:</strong> ${billing.fullName || user?.name || ''}</div>\n                    <div><strong>Address:</strong> ${billingAddressLine}</div>\n                    <div><strong>Phone:</strong> ${billing.phoneNumber || ''}</div>`;

      const shippingHtml = `\n                    <div><strong>Name:</strong> ${shipping.fullName || user?.name || ''}</div>\n                    <div><strong>Address:</strong> ${shippingAddressLine}</div>\n                    <div><strong>Phone:</strong> ${shipping.phoneNumber || ''}</div>`;

      const invoiceHtml = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tax Invoice</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
      .invoice-container { max-width: 210mm; margin: 0 auto; background: white; padding: 0; }
      table { width: 100%; border-collapse: collapse; }
      td, th { border: 1px solid #000; padding: 4px 6px; font-size: 9px; vertical-align: top; }
      .logo-cell { width: 100px; text-align: center; vertical-align: middle; }
      .logo-cell img { width: 70px; height: 70px; }
      .company-info { text-align: center; font-size: 10px; line-height: 1.4; }
      .company-name { font-weight: bold; font-size: 14px; margin-bottom: 3px; }
      .document-type { text-align: right; font-weight: bold; font-size: 10px; width: 100px; line-height: 1.8; }
      .title-row { background: #e6e6ff; text-align: center; font-size: 16px; font-weight: bold; padding: 6px !important; }
      .subtitle { font-size: 8px; font-weight: normal; }
      .info-row td { font-size: 9px; padding: 3px 6px; }
      .section-header { background: #e6e6ff; font-weight: bold; font-size: 9px; text-align: center; padding: 4px !important; }
      .address-cell { font-size: 8px; line-height: 1.5; }
      .table-header { background: #e6e6ff; font-weight: bold; text-align: center; font-size: 8px; padding: 3px 2px !important; }
      .item-row td { font-size: 8px; padding: 2px 4px; }
      .center { text-align: center; }
      .right { text-align: right; }
      .bold { font-weight: bold; }
      .total-row { background: #e6e6ff; font-weight: bold; }
      .bank-details { font-size: 8px; line-height: 1.5; }
      .signature-section { text-align: right; font-size: 9px; padding: 20px 8px 8px 8px !important; }
      .footer-row { background: #e6e6ff; font-size: 8px; text-align: center; padding: 4px !important; }
      @media print { body { padding: 10px; background: white; } .invoice-container { max-width: 100%; margin: 0; padding: 0; } table { page-break-inside: avoid; } td, th { padding: 3px 4px; font-size: 8px; } @page { margin: 10mm; size: A4; } }
    </style>
  </head>
  <body>
    <div class="invoice-container">
      <table class="header-table">
        <tr>
          <td class="logo-cell">
            <img src="logo.webp' width='70' height='70'%3E%3Ccircle cx='35' cy='35' r='33' fill='%234169e1' stroke='%23000' stroke-width='2'/%3E%3Ctext x='35' y='42' text-anchor='middle' fill='white' font-size='16' font-weight='bold'%3ELOGO%3C/text%3E%3C/svg%3E" alt="Company Logo">
          </td>
          <td class="company-info">
            <div class="company-name">BHARAT GRAM UDYOG</div>
            <div>34, WPO TRISULIA MANPURA, GOKHNA, Sonipat, Haryana,</div>
            <div><strong>Haryana, Pin code: 131001</strong></div>
            <div>Email: bharatgramudyog@gmail.com</div>
            <div><strong>GSTIN: 06IICPK3529C1ZN</strong></div>
          </td>
          <td class="document-type">
            <div>Original</div>
          </td>
        </tr>
      </table>

      <table>
        <tr>
          <td colspan="4" class="title-row">
            <div>Tax Invoice</div>
          </td>
        </tr>
        <tr class="info-row">
          <td colspan="2"><strong>Invoice No:</strong> ${invoiceId}</td>
          <td colspan="2"><strong>Dated:</strong> ${new Date().toLocaleDateString()}</td>
        </tr>
      </table>

      <table style="margin-top: 2px;">
        <tr>
          <td colspan="2" class="section-header">Detail of Receiver (Billed to):</td>
          <td colspan="2" class="section-header">Detail of Consignee (Shipped to):</td>
        </tr>
        <tr>
          <td class="address-cell" colspan="2">${billingHtml}</td>
          <td class="address-cell" colspan="2">${shippingHtml}</td>
        </tr>
      </table>

      <table style="margin-top: 2px;">
        <tr class="table-header">
          <td rowspan="2" style="width: 25px;">Sr. No.</td>
          <td rowspan="2" style="width: 120px;">Product Description</td>
          <td rowspan="2" style="width: 50px;">HSN code</td>
          <td rowspan="2" style="width: 30px;">Qty</td>
          <td rowspan="2" style="width: 40px;">Rate</td>
          <td rowspan="2" style="width: 50px;">Amount</td>
          <td colspan="2">Discount</td>
          <td rowspan="2" style="width: 50px;">Total Value</td>
          <td colspan="2">CGST</td>
          <td colspan="2">SGST</td>
          <td rowspan="2" style="width: 50px;">Total Amount</td>
          <td rowspan="2" style="width: 45px;">Total</td>
        </tr>
        <tr class="table-header">
          <td style="width: 25px;">%</td>
          <td style="width: 35px;">Amt</td>
          <td style="width: 25px;">%</td>
          <td style="width: 40px;">Amount</td>
          <td style="width: 25px;">%</td>
          <td style="width: 40px;">Amount</td>
        </tr>
        ${items}
        <tr class="total-row">
          <td colspan="3" class="bold">Total</td>
          <td class="center bold">${order.items ? order.items.length : 0}</td>
          <td></td>
          <td class="right bold">${totalBeforeTax}</td>
          <td class="center"></td>
          <td class="right bold"></td>
          <td class="right bold"></td>
          <td></td>
                <td class="right bold">${cgst}</td>
          <td></td>
                <td class="right bold">${sgst}</td>
          <td></td>
          <td></td>
          <td class="center bold">0</td>
          <td class="right bold">${totalAfterTax}</td>
          <td></td>
        </tr>
      </table>

      <table style="margin-top: 2px;">
        <tr>
          <td rowspan="5" style="width: 60%; vertical-align: top; padding: 6px;">
            <div style="font-size: 9px; font-weight: bold; margin-bottom: 4px;">Total Invoice Amount (in words)</div>
            <div style="font-size: 8px;">${order.totalInWords || ""}</div>
          </td>
          <td colspan="2" class="right" style="font-size: 8px; padding: 2px 6px;\"><strong>Total Amount before Tax</strong></td>
          <td class="right" style="font-size: 8px; padding: 2px 6px; width: 70px;">${totalBeforeTax}</td>
        </tr>
        <tr>
          <td colspan="2" class="right" style="font-size: 8px; padding: 2px 6px;"><strong>Add: CGST (${cgstRate}% )</strong></td>
          <td class="right" style="font-size: 8px; padding: 2px 6px;">${cgst}</td>
        </tr>
        <tr>
          <td colspan="2" class="right" style="font-size: 8px; padding: 2px 6px;"><strong>Add: SGST (${sgstRate}% )</strong></td>
          <td class="right" style="font-size: 8px; padding: 2px 6px;">${sgst}</td>
        </tr>
        <tr>
          <td colspan="2" class="right" style="font-size: 8px; padding: 2px 6px;"><strong>Total Tax Amount</strong></td>
          <td class="right" style="font-size: 8px; padding: 2px 6px;">${totalTax}</td>
        </tr>
        <tr>
          <td colspan="2" class="right bold" style="font-size: 8px; padding: 2px 6px;"><strong>Total Amount after Tax</strong></td>
          <td class="right bold" style="font-size: 8px; padding: 2px 6px;">${totalAfterTax}</td>
        </tr>
      </table>
    </div>
  </body>
  </html>`;

      const filePath = path.join(invoicesDir, `${invoiceId}.html`);
      await fs.writeFile(filePath, invoiceHtml, "utf8");
      const invoiceUrl = `${origin}/uploads/invoices/${invoiceId}.html`;
      result.data.invoiceUrl = invoiceUrl;

      // Persist invoice URL to the Order document so subsequent reads include it
      try {
          // Prefer saving using the same Mongoose document instance returned by create
          if (order && typeof order.save === "function") {
            try {
              order.invoiceUrl = invoiceUrl;
              const savedOrder = await order.save();
              console.log("Saved invoiceUrl via document.save():", savedOrder._id, savedOrder.invoiceUrl);
              result.dbSavedInvoiceUrl = savedOrder.invoiceUrl || null;
              // reflect saved document in response
              result.data.order = savedOrder;
            } catch (docSaveErr) {
              console.warn("Document.save() failed, falling back to updates:", docSaveErr && docSaveErr.message);
            }
          }

        // Resolve possible id locations that different services/controllers may return
        const possibleIds = [];
        if (order && order._id) possibleIds.push(order._id);
        if (result && result.data && result.data._id) possibleIds.push(result.data._id);
        if (result && result.data && result.data.order && result.data.order._id)
          possibleIds.push(result.data.order._id);
        if (result && result.data && result.data.order && result.data.order.id)
          possibleIds.push(result.data.order.id);
        if (result && result.data && result.data.orderId) possibleIds.push(result.data.orderId);

        // pick the first non-empty id
        const saveId = possibleIds.find((v) => !!v);
        if (saveId) {
          const idStr = typeof saveId === "string" ? saveId : saveId.toString();
          console.log("Attempting to persist invoiceUrl", { id: idStr, model: Order.modelName, connName: conn && conn.name });
          try {
            // try findByIdAndUpdate first
            const updated = await Order.findByIdAndUpdate(
              idStr,
              { $set: { invoiceUrl } },
              { new: true }
            ).exec();
            if (!updated) {
              // fallback to updateOne if findByIdAndUpdate didn't match
              let updateFilter = { _id: idStr };
              try {
                if (mongoose.Types.ObjectId.isValid(idStr)) {
                  updateFilter = { _id: new mongoose.Types.ObjectId(idStr) };
                }
              } catch (convErr) {
                console.warn('ObjectId conversion warning for updateOne:', convErr && convErr.message);
              }
              const resUp = await Order.updateOne(updateFilter, { $set: { invoiceUrl } }).exec();
              console.log("updateOne result:", resUp);
              if (!resUp || ((resUp.n === 0 || resUp.matchedCount === 0) && !resUp.acknowledged && resUp.matchedCount !== undefined)) {
                console.warn("Invoice URL update did not match any document for id:", idStr, resUp);
                result.invoiceSaveWarning = `No order document matched id ${idStr}`;
              }
            }
            // verify by reading back the document
            try {
              const saved = await Order.findById(idStr).lean().exec();
              console.log("Post-update order fetch: ", saved ? { _id: saved._id, invoiceUrl: saved.invoiceUrl } : null);
              if (saved) result.dbSavedInvoiceUrl = saved.invoiceUrl || null;
            } catch (fetchErr) {
              console.error("Failed to fetch order after update:", fetchErr);
              result.invoiceSaveWarning = result.invoiceSaveWarning || "Updated but failed to verify by fetch";
            }

            // If invoiceUrl still not present, try native collection update with ObjectId
            if (!result.dbSavedInvoiceUrl) {
              try {
                let objId = null;
                try {
                  if (typeof idStr === 'string' && mongoose.Types.ObjectId.isValid(idStr)) {
                    objId = new mongoose.Types.ObjectId(idStr);
                  } else if (typeof idStr !== 'string') {
                    objId = idStr;
                  }
                } catch (convErr) {
                  console.warn('Could not convert id to ObjectId for native update', idStr, convErr && convErr.message);
                }
                const filter = objId ? { _id: objId } : { _id: idStr };
                const nativeRes = await Order.collection.updateOne(filter, { $set: { invoiceUrl } });
                console.log('Native collection.updateOne result:', nativeRes && (nativeRes.result || nativeRes));
                // re-fetch
                const saved2 = await Order.findById(idStr).lean().exec();
                console.log('Post-native-update fetch:', saved2 ? { _id: saved2._id, invoiceUrl: saved2.invoiceUrl } : null);
                if (saved2) result.dbSavedInvoiceUrl = saved2.invoiceUrl || null;
              } catch (nativeErr) {
                console.error('Native update failed:', nativeErr);
                result.invoiceSaveError = result.invoiceSaveError || nativeErr.message;
              }
            }
            // also reflect in returned order object
            result.data.order = { ...result.data.order, invoiceUrl };
          } catch (innerErr) {
            console.error("Error updating Order document with invoiceUrl:", innerErr);
            result.invoiceSaveError = innerErr.message;
          }
        } else {
          console.warn("No order id available to persist invoiceUrl.", { order, resultData: result && result.data });
          result.invoiceSaveWarning = "No order id available to persist invoiceUrl";
        }
      } catch (dbErr) {
        console.error("Failed to save invoiceUrl to Order document:", dbErr);
        // don't fail the request; keep invoiceUrl in response but log DB error
        result.invoiceSaveError = dbErr.message;
      }
    } catch (err) {
      console.error("Failed to generate invoice file:", err);
      result.invoiceError = err.message;
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.log("Route POST order error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export const GET = withUserAuth(async function (request) {
  try {
    const subdomain = getSubdomain(request);
    //consolle.log('Subdomain:', subdomain);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      //consolle.error('No database connection established');
      return NextResponse.json(
        { success: false, message: "DB not found" },
        { status: 404 }
      );
    }
    //consolle.log('Connection name in route:', conn.name);
    const Order = conn.models.Order || conn.model("Order", OrderSchema);
    const Coupon = conn.models.Coupon || conn.model("Coupon", CouponSchema);
    const Product = conn.models.Product || conn.model("Product", ProductSchema);
    const Variant = conn.models.Variant || conn.model("Variant", VariantSchema);
    const orderRepo = new OrderRepository(Order, conn);
    const couponRepo = new CouponRepository(Coupon);
    const couponService = new CouponService(couponRepo);
    const emailService = new EmailService();
    const orderService = new OrderService(
      orderRepo,
      couponService,
      emailService
    );
    const orderController = new OrderController(orderService);
    const result = await orderController.getUserOrders(request, conn);
    // Attach invoiceUrl for each order if invoice file exists
    try {
      const origin = (new URL(request.url)).origin;
      const invoicesDir = path.join(process.cwd(), "public", "uploads", "invoices");
      const attachUrl = async (ord) => {
        if (!ord) return ord;
        // Coerce id to string for filename
        const id = ord._id ? (typeof ord._id === "string" ? ord._id : ord._id.toString()) : null;
        if (!id) return ord;
        const filePath = path.join(invoicesDir, `${id}.html`);
        try {
          await fs.access(filePath);
          ord.invoiceUrl = `${origin}/uploads/invoices/${id}.html`;
        } catch (e) {
          // file doesn't exist — skip
        }
        return ord;
      };

      // Support several common shapes returned by services/controllers
      if (Array.isArray(result.data)) {
        await Promise.all(result.data.map((o) => attachUrl(o)));
      } else if (result.data && Array.isArray(result.data.results)) {
        await Promise.all(result.data.results.map((o) => attachUrl(o)));
      } else if (result.data && Array.isArray(result.data.orders)) {
        await Promise.all(result.data.orders.map((o) => attachUrl(o)));
      } else if (result.data && typeof result.data === 'object' && result.data._id) {
        // single order object
        await attachUrl(result.data);
      }
    } catch (e) {
      console.error('Error attaching invoice URLs', e);
    }
    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalCount: result.totalCount,
    });
  } catch (error) {
    //consolle.error('Route GET my orders error:', error.message, error.stack);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
});
