// backend/src/controllers/invoiceController.js - FULL UPDATED
import Invoice from '../models/Invoice.js';
import { sendInvoiceEmail } from '../utils/emailService.js';
import { sendWhatsAppInvoice, sendConnectionRequest as sendWhatsAppConnectionRequest } from '../utils/whatsappService.js';

/**
 * @desc Check for existing invoice and handle package changes
 */
const handleExistingInvoice = async (customerEmail, planName, newPlanData) => {
    try {
        console.log('🔍 [INVOICE CHECK] Checking for existing invoices:', { customerEmail, planName });
        
        // Check for existing invoice with same plan
        const existingSamePlan = await Invoice.findOne({
            customerEmail: customerEmail.toLowerCase(),
            planName: planName,
            status: { $in: ['pending', 'completed'] }
        });
        
        if (existingSamePlan) {
            console.log('🔄 [INVOICE CHECK] Found existing invoice with same plan:', existingSamePlan.invoiceNumber);
            return {
                action: 'update',
                invoice: existingSamePlan,
                message: 'Updating existing invoice with same plan'
            };
        }
        
        // Check if customer has any other active invoices
        const customerInvoices = await Invoice.find({
            customerEmail: customerEmail.toLowerCase(),
            status: { $in: ['pending', 'completed'] }
        });
        
        if (customerInvoices.length > 0) {
            console.log('❌ [INVOICE CHECK] Customer has other active invoices:', customerInvoices.map(i => i.planName));
            return {
                action: 'block',
                invoice: customerInvoices[0],
                message: `Customer already has active ${customerInvoices[0].planName} invoice`
            };
        }
        
        console.log('✅ [INVOICE CHECK] No conflicts - creating new invoice');
        return {
            action: 'create',
            invoice: null,
            message: 'Creating new invoice'
        };
    } catch (error) {
        console.error('❌ [INVOICE CHECK] Error:', error);
        throw error;
    }
};

// ✅ NEW: Function to check for existing active invoices by customer details
export const checkExistingActiveInvoices = async (req, res) => {
    try {
        const { email, phone } = req.query;
        
        console.log('🔍 [EXISTING INVOICE CHECK] Checking for existing invoices:', { email, phone });
        
        if (!email && !phone) {
            return res.status(400).json({
                success: false,
                message: 'Email or phone number is required to check existing invoices'
            });
        }

        let query = {};
        if (email) {
            query.customerEmail = email.toLowerCase().trim();
        }
        if (phone) {
            query.customerPhone = phone.trim().replace(/\s+/g, '');
        }

        // Find active invoices (pending or completed)
        const activeInvoices = await Invoice.find({
            ...query,
            status: { $in: ['pending', 'completed'] }
        }).sort({ createdAt: -1 }); // Get most recent first

        console.log('📋 [EXISTING INVOICE CHECK] Found active invoices:', activeInvoices.length);

        if (activeInvoices.length === 0) {
            return res.json({
                success: true,
                hasActiveInvoices: false,
                message: 'No active invoices found'
            });
        }

        // Return the most recent active invoice
        const latestInvoice = activeInvoices[0];
        
        res.json({
            success: true,
            hasActiveInvoices: true,
            activeInvoice: {
                _id: latestInvoice._id,
                invoiceNumber: latestInvoice.invoiceNumber,
                customerName: latestInvoice.customerName,
                customerEmail: latestInvoice.customerEmail,
                customerPhone: latestInvoice.customerPhone,
                customerLocation: latestInvoice.customerLocation,
                planName: latestInvoice.planName,
                planSpeed: latestInvoice.planSpeed,
                planPrice: latestInvoice.planPrice,
                features: latestInvoice.features,
                connectionType: latestInvoice.connectionType,
                status: latestInvoice.status,
                invoiceDate: latestInvoice.invoiceDate,
                dueDate: latestInvoice.dueDate,
                createdAt: latestInvoice.createdAt,
                connectionRequestSent: latestInvoice.connectionRequestSent,
                connectionRequestSentAt: latestInvoice.connectionRequestSentAt
            },
            totalActiveInvoices: activeInvoices.length,
            message: `Found active ${latestInvoice.planName} plan invoice`
        });

    } catch (error) {
        console.error('❌ [EXISTING INVOICE CHECK] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking for existing invoices',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

/**
 * @desc Create or update invoice for customer
 * @route POST /api/invoices
 * @access Public
 */
export const createInvoice = async (req, res) => {
    console.log('🔍 [CONTROLLER] Starting invoice processing...');
    
    try {
        const {
            planPrice,
            notes,
            sendNotifications = true,
            status = 'pending',
            invoiceDate,
            dueDate,
        } = req.body;

        // ✅ Sanitize input with defaults
        const customerName = (req.body.customerName || '').trim();
        const customerEmail = (req.body.customerEmail || '').trim().toLowerCase();
        const customerPhone = (req.body.customerPhone || '').trim();
        const customerLocation = (req.body.customerLocation || '').trim();
        const planName = (req.body.planName || '').trim();
        const planSpeed = (req.body.planSpeed || '').trim();
        const connectionType = (req.body.connectionType || 'Fiber Optic').trim();
        const features = Array.isArray(req.body.features) ? req.body.features : [];

        console.log('🔍 [CONTROLLER] Processing request for:', { customerEmail, planName });

        // ✅ Enhanced validation with better error messages
        const requiredFields = [
            { field: 'customerName', value: customerName, message: 'Customer name is required' },
            { field: 'customerEmail', value: customerEmail, message: 'Customer email is required' },
            { field: 'customerPhone', value: customerPhone, message: 'Customer phone is required' },
            { field: 'customerLocation', value: customerLocation, message: 'Customer location is required' },
            { field: 'planName', value: planName, message: 'Plan name is required' },
            { field: 'planSpeed', value: planSpeed, message: 'Plan speed is required' },
            { field: 'planPrice', value: planPrice, message: 'Plan price is required' }
        ];

        const missingFields = requiredFields.filter(item => !item.value);
        
        if (missingFields.length > 0) {
            console.log('❌ [CONTROLLER] Missing required fields:', missingFields.map(f => f.field));
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.map(f => f.field).join(', ')}`,
                details: missingFields.map(f => f.message)
            });
        }

        // ✅ Validate email format
        if (!/^\S+@\S+\.\S+$/.test(customerEmail)) {
            console.log('❌ [CONTROLLER] Invalid email format:', customerEmail);
            return res.status(400).json({
                success: false,
                message: 'Invalid email format. Please provide a valid email address.',
            });
        }

        // ✅ Enhanced planPrice validation
        let parsedPlanPrice;
        try {
            if (typeof planPrice === 'string') {
                parsedPlanPrice = parseInt(planPrice.replace(/,/g, ''), 10);
            } else {
                parsedPlanPrice = Number(planPrice);
            }

            if (isNaN(parsedPlanPrice)) throw new Error('Not a number');
            if (parsedPlanPrice <= 0) throw new Error('Must be positive');
            console.log('✅ [CONTROLLER] Plan price parsed successfully:', parsedPlanPrice);
        } catch (priceError) {
            console.log('❌ [CONTROLLER] Invalid plan price:', planPrice, 'Error:', priceError.message);
            return res.status(400).json({
                success: false,
                message: `Invalid plan price: "${planPrice}". Must be a positive number.`,
            });
        }

        // ✅ Handle dates
        const now = new Date();
        const finalInvoiceDate = invoiceDate ? new Date(invoiceDate) : now;
        const finalDueDate = dueDate ? new Date(dueDate) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        // ✅ Prepare plan data
        const planData = { planName, planPrice: parsedPlanPrice, planSpeed, features };

        // ✅ CHECK FOR EXISTING INVOICE AND HANDLE ACCORDINGLY
        console.log('🔍 [CONTROLLER] Checking invoice status...');
        const invoiceCheck = await handleExistingInvoice(customerEmail, planName, planData);

        let invoice;
        let action = 'created';

        if (invoiceCheck.action === 'update') {
            console.log('🔄 [CONTROLLER] Updating existing invoice:', invoiceCheck.invoice.invoiceNumber);
            
            // Update existing invoice
            const updatedInvoice = await Invoice.findByIdAndUpdate(
                invoiceCheck.invoice._id,
                {
                    planPrice: parsedPlanPrice,
                    planSpeed,
                    features,
                    connectionType,
                    notes: notes || '',
                    updatedAt: new Date()
                },
                { new: true, runValidators: true }
            );
            
            invoice = updatedInvoice;
            action = 'updated';
            console.log('✅ [CONTROLLER] Invoice updated successfully');

        } else if (invoiceCheck.action === 'block') {
            console.log('❌ [CONTROLLER] Blocking - customer has other active invoices');
            return res.status(400).json({
                success: false,
                message: `You already have an active ${invoiceCheck.invoice.planName} plan invoice. Please complete or cancel your existing invoice before creating a new one.`,
                existingInvoiceId: invoiceCheck.invoice._id,
                existingInvoiceNumber: invoiceCheck.invoice.invoiceNumber,
                existingPlan: invoiceCheck.invoice.planName,
                error: 'EXISTING_ACTIVE_INVOICE',
                solution: 'Contact support to change your plan or cancel existing invoice'
            });

        } else {
            console.log('🆕 [CONTROLLER] Creating new invoice...');
            const invoiceData = {
                customerName,
                customerEmail,
                customerPhone,
                customerLocation,
                planName,
                planSpeed,
                planPrice: parsedPlanPrice,
                features,
                connectionType,
                notes: notes || '',
                status: ['pending', 'paid', 'cancelled', 'completed', 'overdue'].includes(status) ? status : 'pending',
                invoiceDate: finalInvoiceDate,
                dueDate: finalDueDate,
            };

            invoice = new Invoice(invoiceData);
            await invoice.save();
            console.log('✅ [CONTROLLER] New invoice created:', invoice.invoiceNumber);
        }

        console.log(`✅ [CONTROLLER] Invoice ${action} successfully:`, invoice.invoiceNumber);

        // ✅ Send notifications (non-blocking)
        if (sendNotifications) {
            console.log('🔍 [CONTROLLER] Sending notifications...');
            try {
                const notificationPromises = [];
                if (sendInvoiceEmail) {
                    notificationPromises.push(
                        sendInvoiceEmail(invoice).catch(err => console.error('❌ Email failed:', err.message))
                    );
                }
                if (sendWhatsAppInvoice) {
                    notificationPromises.push(
                        sendWhatsAppInvoice(invoice).catch(err => console.error('❌ WhatsApp failed:', err.message))
                    );
                }
                await Promise.allSettled(notificationPromises);
                console.log('✅ [CONTROLLER] All notifications processed');
            } catch (notifyError) {
                console.warn('⚠️ [CONTROLLER] Notification system error:', notifyError.message);
            }
        }

        console.log('🎉 [CONTROLLER] Invoice processing completed successfully!');
        return res.status(action === 'created' ? 201 : 200).json({
            success: true,
            message: `Invoice ${action} successfully!`,
            action,
            invoice,
            isPlanUpdate: action === 'updated',
            invoiceNumber: invoice.invoiceNumber
        });

    } catch (error) {
        console.error('❌ [CONTROLLER] Invoice processing failed!', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error while processing invoice',
            ...(process.env.NODE_ENV === 'development' && { error: { name: error.name, message: error.message } })
        });
    }
};

/**
 * @desc Send connection request to WhatsApp
 */
export const sendConnectionRequestToOwner = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findById(id);
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

        const whatsappResult = await sendWhatsAppConnectionRequest(invoice);
        
        // Update invoice to mark connection request as sent
        await Invoice.findByIdAndUpdate(id, {
            connectionRequestSent: true,
            connectionRequestSentAt: new Date(),
            status: 'completed'
        });

        res.json({
            success: true,
            message: 'Connection request sent successfully! Our team will contact you shortly.',
            invoice: {
                id: invoice._id,
                invoiceNumber: invoice.invoiceNumber,
                status: 'completed',
                connectionRequestSent: true,
                connectionRequestSentAt: new Date()
            },
            whatsappResult
        });
    } catch (error) {
        console.error('❌ [CONTROLLER] Error sending connection request:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error sending connection request', 
            error: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
};

/**
 * @desc Get customer invoice history
 */
export const getCustomerInvoices = async (req, res) => {
    try {
        const { email } = req.params;
        const invoices = await Invoice.find({ customerEmail: email.toLowerCase() }).sort({ createdAt: -1 });

        res.json({
            success: true,
            customerEmail: email,
            totalInvoices: invoices.length,
            activeInvoices: invoices.filter(inv => ['pending', 'completed'].includes(inv.status)),
            invoiceHistory: invoices
        });
    } catch (error) {
        console.error('❌ Error fetching customer invoices:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching invoice history', 
            ...(process.env.NODE_ENV === 'development' && { error: error.message }) 
        });
    }
};

/**
 * @desc Get paginated invoices
 */
export const getInvoices = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

        const query = {};
        if (status && ['pending', 'paid', 'cancelled', 'completed', 'overdue'].includes(status)) {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { customerName: { $regex: search, $options: 'i' } },
                { customerEmail: { $regex: search, $options: 'i' } },
                { planName: { $regex: search, $options: 'i' } },
                { invoiceNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const invoices = await Invoice.find(query)
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);
            
        const total = await Invoice.countDocuments(query);

        res.json({ 
            success: true, 
            count: invoices.length, 
            total, 
            pages: Math.ceil(total / limitNum), 
            currentPage: pageNum, 
            invoices 
        });
    } catch (error) {
        console.error('❌ Error fetching invoices:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching invoices', 
            ...(process.env.NODE_ENV === 'development' && { error: error.message }) 
        });
    }
};

/**
 * @desc Get single invoice by ID
 */
export const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
        res.json({ success: true, invoice });
    } catch (error) {
        console.error('❌ Error fetching invoice:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching invoice', 
            ...(process.env.NODE_ENV === 'development' && { error: error.message }) 
        });
    }
};

/**
 * @desc Update invoice status
 */
export const updateInvoiceStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'paid', 'cancelled', 'completed', 'overdue'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const updateData = { status };
        if (status === 'paid') updateData.paidAt = new Date();

        const invoice = await Invoice.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

        res.json({ 
            success: true, 
            message: 'Invoice status updated successfully', 
            invoice 
        });
    } catch (error) {
        console.error('❌ Error updating invoice status:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating invoice status', 
            ...(process.env.NODE_ENV === 'development' && { error: error.message }) 
        });
    }
};

/**
 * @desc Resend invoice notifications
 */
export const resendInvoiceNotifications = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

        const [emailResult, whatsappResult] = await Promise.allSettled([
            sendInvoiceEmail(invoice), 
            sendWhatsAppInvoice(invoice)
        ]);
        
        res.json({
            success: true,
            message: 'Notifications resent successfully',
            notifications: {
                email: { 
                    success: emailResult.status === 'fulfilled', 
                    error: emailResult.status === 'rejected' ? emailResult.reason?.message : null 
                },
                whatsapp: { 
                    success: whatsappResult.status === 'fulfilled', 
                    error: whatsappResult.status === 'rejected' ? whatsappResult.reason?.message : null 
                }
            }
        });
    } catch (error) {
        console.error('❌ Error resending notifications:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error resending notifications', 
            ...(process.env.NODE_ENV === 'development' && { error: error.message }) 
        });
    }
};

/**
 * @desc Delete invoice
 */
export const deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndDelete(req.params.id);
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

        res.json({ success: true, message: 'Invoice deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting invoice:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting invoice', 
            ...(process.env.NODE_ENV === 'development' && { error: error.message }) 
        });
    }
};

/**
 * @desc Get invoice statistics
 */
export const getInvoiceStats = async (req, res) => {
    try {
        const stats = await Invoice.aggregate([
            { 
                $group: { 
                    _id: '$status', 
                    count: { $sum: 1 }, 
                    totalAmount: { $sum: '$planPrice' } 
                } 
            }
        ]);
        
        const totalInvoices = await Invoice.countDocuments();
        const totalRevenue = await Invoice.aggregate([
            { $match: { status: 'paid' } }, 
            { $group: { _id: null, total: { $sum: '$planPrice' } } }
        ]);

        res.json({ 
            success: true, 
            stats: { 
                byStatus: stats, 
                totalInvoices, 
                totalRevenue: totalRevenue[0]?.total || 0 
            } 
        });
    } catch (error) {
        console.error('❌ Error fetching invoice stats:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching invoice statistics', 
            ...(process.env.NODE_ENV === 'development' && { error: error.message }) 
        });
    }
};