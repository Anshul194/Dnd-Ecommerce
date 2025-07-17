import AttributeService from '../services/attributeService.js';
import { errorResponse, successResponse } from '../../utils/response.js';
import { attributeCreateValidator, attributeUpdateValidator } from '../../validators/attributeValidator.js';

const attributeService = new AttributeService();

export const createAttribute = async (req, res) => {
  try {
    const { error } = attributeCreateValidator.validate(req.body);
    if (error) return res.status(400).json(errorResponse(error.details[0].message));

    const attribute = await attributeService.createAttribute(req.body);
    return res.status(201).json(successResponse("Attribute created", attribute));
  } catch (err) {
    return res.status(500).json(errorResponse(err.message));
  }
};

export const getAllAttributes = async (req, res) => {
  try {
    const attributes = await attributeService.getAllAttributes();
    return res.json(successResponse("Attributes fetched", attributes));
  } catch (err) {
    return res.status(500).json(errorResponse(err.message));
  }
};

export const getAttributeById = async (req, res) => {
  try {
    const attribute = await attributeService.getAttributeById(req.params.id);
    if (!attribute) return res.status(404).json(errorResponse("Attribute not found"));
    return res.json(successResponse("Attribute found", attribute));
  } catch (err) {
    return res.status(500).json(errorResponse(err.message));
  }
};

export const updateAttribute = async (req, res) => {
  try {
    const { error } = attributeUpdateValidator.validate(req.body);
    if (error) return res.status(400).json(errorResponse(error.details[0].message));

    const updated = await attributeService.updateAttribute(req.params.id, req.body);
    return res.json(successResponse("Attribute updated", updated));
  } catch (err) {
    return res.status(500).json(errorResponse(err.message));
  }
};

export const deleteAttribute = async (req, res) => {
  try {
    await attributeService.deleteAttribute(req.params.id);
    return res.json(successResponse("Attribute deleted"));
  } catch (err) {
    return res.status(500).json(errorResponse(err.message));
  }
};

export const searchAttributesByName = async (req, res) => {
  try {
    const { name } = req.query;
    const results = await attributeService.searchAttributesByName(name);
    return res.json(successResponse("Search complete", results));
  } catch (err) {
    return res.status(500).json(errorResponse(err.message));
  }
};