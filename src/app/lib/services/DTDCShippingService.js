import axios from "axios";

class DTDCShippingService {
  constructor() {
    this.baseURL =
      "https://alphademodashboardapi.shipsy.io/api/customer/integration/consignment/softdata";
    this.apiKey = process.env.DTDC_API_KEY || "<api-key>";
    this.customerCode = process.env.DTDC_CUSTOMER_CODE || "<Customer Code>";
  }

  /**
   * Create shipping order with DTDC
   * @param {Object} orderData - Order information
   * @param {Object} shippingDetails - Shipping details from request
   * @returns {Object} - API response
   */
  async createShipping(orderData, shippingDetails) {
    try {
      //console.log("Creating DTDC shipping for order:", orderData._id);

      // Validate required fields
      this.validateOrderData(orderData);
      this.validateShippingDetails(shippingDetails);

      // Transform order data to DTDC format
      const dtdcPayload = this.transformToDTO(orderData, shippingDetails);

      //console.log("DTDC API Payload:", JSON.stringify(dtdcPayload, null, 2));

      // Make API call to DTDC
      const response = await axios.post(this.baseURL, dtdcPayload, {
        headers: {
          "api-key": this.apiKey,
          "Content-Type": "application/json",
        },
      });

      //console.log("DTDC API Response:", response.data);

      // Process response
      return this.processResponse(response.data);
    } catch (error) {
      //console.error("DTDC Shipping Error:", error.message);

      if (error.response) {
        //console.error("DTDC API Error Response:", error.response.data);
        throw new Error(
          `DTDC API Error: ${error.response.data.message || error.response.statusText
          }`
        );
      }

      throw new Error(`DTDC Shipping Service Error: ${error.message}`);
    }
  }

  /**
   * Validate order data
   * @param {Object} orderData
   */
  validateOrderData(orderData) {
    if (!orderData) {
      throw new Error("Order data is required");
    }

    if (!orderData.shippingAddress) {
      throw new Error("Shipping address is required");
    }

    if (!orderData.items || orderData.items.length === 0) {
      throw new Error("Order items are required");
    }

    const address = orderData.shippingAddress;
    const requiredFields = [
      "name",
      "phone",
      "address",
      "postalCode",
      "city",
      "state",
    ];

    for (const field of requiredFields) {
      if (!address[field]) {
        throw new Error(`Shipping address ${field} is required`);
      }
    }
  }

  /**
   * Validate shipping details from request
   * @param {Object} shippingDetails
   */
  validateShippingDetails(shippingDetails) {
    if (!shippingDetails) {
      throw new Error("Shipping details are required");
    }

    const requiredFields = ["service_type_id", "dimensions", "weight"];

    for (const field of requiredFields) {
      if (!shippingDetails[field]) {
        throw new Error(`${field} is required for DTDC shipping`);
      }
    }

    // Validate dimensions
    const { dimensions } = shippingDetails;
    if (!dimensions.length || !dimensions.width || !dimensions.height) {
      throw new Error("Length, width, and height are required in dimensions");
    }
  }

  /**
   * Transform order data to DTDC API format
   * @param {Object} orderData
   * @param {Object} shippingDetails
   * @returns {Object}
   */
  transformToDTO(orderData, shippingDetails) {
    const { shippingAddress, items, totalAmount, _id } = orderData;
    const { service_type_id, dimensions, weight, declared_value } =
      shippingDetails;

    // Calculate total declared value if not provided
    const calculatedDeclaredValue =
      declared_value || totalAmount || this.calculateDeclaredValue(items);

    // Create pieces detail from order items
    const piecesDetail = items.map((item, index) => ({
      description: item.product?.name || `Product ${index + 1}`,
      declared_value: (item.price * item.quantity).toString(),
      weight: (weight / items.length).toString(), // Distribute weight evenly
      height: dimensions.height.toString(),
      length: dimensions.length.toString(),
      width: dimensions.width.toString(),
    }));

    return {
      consignments: [
        {
          customer_code: this.customerCode,
          service_type_id: service_type_id,
          load_type: "NON-DOCUMENT",
          description: this.getOrderDescription(items),
          dimension_unit: "cm",
          length: dimensions.length.toString(),
          width: dimensions.width.toString(),
          height: dimensions.height.toString(),
          weight_unit: "kg",
          weight: weight.toString(),
          declared_value: calculatedDeclaredValue.toString(),
          num_pieces: items.length.toString(),
          origin_details: this.getOriginDetails(),
          destination_details: {
            name: shippingAddress.name,
            phone: shippingAddress.phone,
            alternate_phone: shippingAddress.alternatePhone || "",
            address_line_1: shippingAddress.address,
            address_line_2: shippingAddress.address2 || "",
            pincode: shippingAddress.postalCode,
            city: shippingAddress.city,
            state: shippingAddress.state,
          },
          customer_reference_number: _id.toString(),
          cod_collection_mode: orderData.paymentMode === "COD" ? "cash" : "",
          cod_amount:
            orderData.paymentMode === "COD" ? totalAmount.toString() : "0",
          commodity_id: "7", // Default commodity ID
          reference_number: "",
          pieces_detail: piecesDetail,
        },
      ],
    };
  }

  /**
   * Get origin details (store/warehouse details)
   * This should be configurable based on your store setup
   * @returns {Object}
   */
  getOriginDetails() {
    return {
      name: process.env.STORE_NAME || "YOUR STORE NAME",
      phone: process.env.STORE_PHONE || "9987456321",
      alternate_phone: process.env.STORE_ALT_PHONE || "",
      address_line_1: process.env.STORE_ADDRESS || "Your Store Address",
      address_line_2: process.env.STORE_ADDRESS_2 || "",
      pincode: process.env.STORE_PINCODE || "110046",
      city: process.env.STORE_CITY || "New Delhi",
      state: process.env.STORE_STATE || "Delhi",
    };
  }

  /**
   * Generate order description from items
   * @param {Array} items
   * @returns {String}
   */
  getOrderDescription(items) {
    if (items.length === 1) {
      return items[0].product?.name || "Product";
    }
    return `Order with ${items.length} items`;
  }

  /**
   * Calculate declared value from items
   * @param {Array} items
   * @returns {Number}
   */
  calculateDeclaredValue(items) {
    return items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  }

  /**
   * Process DTDC API response
   * @param {Object} responseData
   * @returns {Object}
   */
  processResponse(responseData) {
    // Check if the response indicates success
    if (responseData.status === "success" || responseData.success) {
      const consignment =
        responseData.consignments?.[0] || responseData.data?.[0];

      return {
        success: true,
        message: "Shipping created successfully with DTDC",
        data: {
          tracking_number:
            consignment?.reference_number || consignment?.awb_number,
          courier: "DTDC",
          service_type: consignment?.service_type_id,
          estimated_delivery: consignment?.estimated_delivery_date,
          shipping_cost: consignment?.shipping_cost,
          consignment_id: consignment?.consignment_id,
          raw_response: responseData,
        },
      };
    } else {
      // Handle API errors
      throw new Error(
        responseData.message || "Failed to create shipping with DTDC"
      );
    }
  }
}

export default DTDCShippingService;
