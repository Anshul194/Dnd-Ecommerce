import { NextResponse } from 'next/server';
import { getSubdomain, getDbConnection } from '../../../lib/tenantDb';
import mongoose from 'mongoose';
import FaqController from '../../../lib/controllers/FaqController.js';
import FaqService from '../../../lib/services/FaqService.js';
import FaqRepository from '../../../lib/repository/FaqRepository.js';
import { FaqSchema } from '../../../lib/models/Faq.js';

export async function GET(req, { params }) {
  try {
    const id = params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid FAQ ID' }, { status: 400 });
    }

    const subdomain = getSubdomain(req);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }

    const Faq = conn.models.Faq || conn.model('Faq', FaqSchema);
    const faqRepo = new FaqRepository(Faq);
    const faqService = new FaqService(faqRepo);
    const faqController = new FaqController(faqService);
    const faq = await faqController.getById(id, conn);
    
    if (!faq) {
      return NextResponse.json({ success: false, message: 'FAQ not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, faq });
  } catch (error) {
    //console.error('Route GET by ID error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const id = params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid FAQ ID' }, { status: 400 });
    }

    const body = await req.json();
    const subdomain = getSubdomain(req);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }

    const Faq = conn.models.Faq || conn.model('Faq', FaqSchema);
    const faqRepo = new FaqRepository(Faq);
    const faqService = new FaqService(faqRepo);
    const faqController = new FaqController(faqService);
    const result = await faqController.update(id, { body }, conn);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    
    return NextResponse.json({ success: true, faq: result.data });
  } catch (error) {
    //console.error('Route PUT error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const id = params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid FAQ ID' }, { status: 400 });
    }

    const subdomain = getSubdomain(req);
    const conn = await getDbConnection(subdomain);
    if (!conn) {
      return NextResponse.json({ success: false, message: 'DB not found' }, { status: 404 });
    }

    const Faq = conn.models.Faq || conn.model('Faq', FaqSchema);
    const faqRepo = new FaqRepository(Faq);
    const faqService = new FaqService(faqRepo);
    const faqController = new FaqController(faqService);
    const result = await faqController.delete(id, conn);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    
    return NextResponse.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    //console.error('Route DELETE error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
