import PlanService from '../services/planService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

const planService = new PlanService();

// Create a new plan
export async function createPlan(form) {
    try {
        const {
            name,
            description,
            price,
            currency,
            features,
            availability,
            duration,
            isActive,
            discount,
            discountType,
            trialPeriod,
            trialPeriodType,
            isFeatured,
            metadata,
            createdBy
        } = form;

        // Optionally add validation here

        const existing = await planService.findByName(name);
        if (existing && existing.status !== 404) {
            return {
                status: 400,
                body: {
                    success: false,
                    message: 'Plan with this name already exists',
                    data: null
                }
            };
        }

        const newPlan = await planService.createPlan({
            name,
            description,
            price,
            currency,
            features,
            availability,
            duration,
            isActive: typeof isActive === 'boolean' ? isActive : true,
            discount,
            discountType,
            trialPeriod,
            trialPeriodType,
            isFeatured,
            metadata: metadata || {},
            createdBy: createdBy || null
        });

        return {
            status: 201,
            body: {
                success: true,
                message: "Plan created",
                data: newPlan
            }
        };
    } catch (err) {
        console.error('Create Plan error:', err.message);
        return {
            status: 500,
            body: {
                success: false,
                message: 'Server error',
                data: null
            }
        };
    }
}

// Get all plans
export async function getPlans(query) {
    try {
        const plans = await planService.getPlans(query);
        return {
            status: 200,
            body: {
                success: true,
                message: "Plans fetched successfully",
                data: plans
            }
        };
    } catch (err) {
        console.error('Get Plans error:', err.message);
        return {
            status: 500,
            body: {
                success: false,
                message: 'Server error',
                data: null
            }
        };
    }
}

// Get a plan by ID
export async function getPlanById(id) {
    try {
        const plan = await planService.getPlanById(id);
        if (!plan) {
            return {
                status: 404,
                body: {
                    success: false,
                    message: 'Plan not found',
                    data: null
                }
            };
        }
        return {
            status: 200,
            body: {
                success: true,
                message: "Plan fetched",
                data: plan
            }
        };
    } catch (err) {
        console.error('Get Plan error:', err.message);
        return {
            status: 500,
            body: {
                success: false,
                message: 'Server error',
                data: null
            }
        };
    }
}

// Update a plan by ID
export async function updatePlan(id, data) {
    try {
        const updated = await planService.updatePlan(id, data);
        if (!updated) {
            return {
                status: 404,
                body: {
                    success: false,
                    message: 'Plan not found',
                    data: null
                }
            };
        }
        return {
            status: 200,
            body: {
                success: true,
                message: "Plan updated",
                data: updated
            }
        };
    } catch (err) {
        console.error('Update Plan error:', err.message);
        return {
            status: 500,
            body: {
                success: false,
                message: 'Server error',
                data: null
            }
        };
    }
}

// Delete a plan by ID
export async function deletePlan(id) {
    try {
        const deleted = await planService.deletePlan(id);
        if (!deleted) {
            return {
                status: 404,
                body: {
                    success: false,
                    message: 'Plan not found',
                    data: null
                }
            };
        }
        return {
            status: 200,
            body: {
                success: true,
                message: "Plan deleted",
                data: deleted
            }
        };
    } catch (err) {
        console.error('Delete Plan error:', err.message);
        return {
            status: 500,
            body: {
                success: false,
                message: 'Server error',
                data: null
            }
        };
    }
}
