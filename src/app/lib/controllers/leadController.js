import { NextResponse } from 'next/server';
import {
  createLeadService,
  getLeadsService,
  getLeadByIdService,
  updateLeadService,
  deleteLeadService,
} from '../services/leadService.js';

export const createLeadController = async (body, conn) => {
  try {
    const lead = await createLeadService(body, conn);
    return NextResponse.json({
      success: true,
      message: 'Lead created successfully',
      data: lead,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to create lead',
      error: error?.message || 'Something went wrong',
    }, { status: 500 });
  }
};

// export const getLeadsController = async (query, conn) => {
//   try {
//     const leads = await getLeadsService(conn); // ✅ pass conn here
//     return NextResponse.json({
//       success: true,
//       message: 'Leads fetched successfully',
//       data: leads,
//     });
//   } catch (error) {
//     return NextResponse.json({
//       success: false,
//       message: 'Failed to fetch leads',
//       error: error?.message || 'Something went wrong',
//     }, { status: 500 });
//   }
// };
export const getLeadsController = async (query, conn) => {
  try {
    const leads = await getLeadsService(conn); // assuming it returns an array

    // Optional: pagination placeholders
    const currentPage = 1;
    const totalDocuments = leads.length;
    const totalPages = 1;

    return NextResponse.json({
      success: true,
      message: 'Leads fetched successfully',
      data: {
        result: leads,
        currentPage,
        totalPages,
        totalDocuments
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch leads',
      error: error?.message || 'Something went wrong',
    }, { status: 500 });
  }
};


export const getLeadByIdController = async (id, conn) => {
  try {
    const lead = await getLeadByIdService(id, conn); // ✅ Fix: pass conn
    if (!lead) {
      return NextResponse.json({
        success: false,
        message: 'Lead not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Lead fetched successfully',
      data: lead,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch lead',
      error: error?.message || 'Something went wrong',
    }, { status: 500 });
  }
};


export const updateLeadController = async (body, id, conn) => {
  try {
    console.log('Updating lead with ID:', id);
    console.log('Request body:', body);

    const updated = await updateLeadService(id, body, conn);

    if (!updated) {
      return NextResponse.json({
        success: false,
        message: 'Lead not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully',
      data: updated,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to update lead',
      error: error?.message || 'Something went wrong',
    }, { status: 500 });
  }
};




export const deleteLeadController = async (id, conn) => {
  try {
    const deleted = await deleteLeadService(id, conn); // ✅ now passing conn

    if (!deleted) {
      return NextResponse.json({
        success: false,
        message: 'Lead not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to delete lead',
      error: error?.message || 'Something went wrong',
    }, { status: 500 });
  }
};


export const convertLeadController = async (leadId, customerId, conn) => {
  try {
    const updatedLead = await updateLeadService(leadId, {
      converted: true,
      convertedTo: customerId,
      status: 'converted',
    }, conn);

    if (!updatedLead) {
      return {
        status: 404,
        body: {
          success: false,
          message: 'Lead not found or conversion failed',
        },
      };
    }

    return {
      status: 200,
      body: {
        success: true,
        message: 'Lead successfully converted to customer',
        data: updatedLead,
      },
    };
  } catch (error) {
    console.error('Error converting lead:', error);
    return {
      status: 500,
      body: {
        success: false,
        message: 'Failed to convert lead',
        error: error?.message || 'Something went wrong',
      },
    };
  }
};
