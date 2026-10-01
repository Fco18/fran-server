const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Student = require('../models/Student');

// Create a new payment
router.post('/', async (req, res) => {
    try {
        // Verify if student exists
        const student = await Student.findById(req.body.studentId);
        if (!student) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }

        const payment = new Payment(req.body);
        const savedPayment = await payment.save();

        // Populate student details in response
        const populatedPayment = await Payment.findById(savedPayment._id)
            .populate('studentId', 'name email grade');

        res.status(201).json(populatedPayment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all payments with optional filters
router.get('/', async (req, res) => {
    try {
        const { studentId, status, paymentMethod, startDate, endDate } = req.query;
        const filter = {};

        if (studentId) filter.studentId = studentId;
        if (status) filter.status = status;
        if (paymentMethod) filter.paymentMethod = paymentMethod;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = startDate;
            if (endDate) filter.date.$lte = endDate;
        }

        const payments = await Payment.find(filter)
            .populate('studentId', 'name email grade')
            .sort({ date: -1, createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get payment by ID
router.get('/:id', async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('studentId', 'name email grade');
        if (payment) {
            res.json(payment);
        } else {
            res.status(404).json({ message: 'Pago no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update payment
router.put('/:id', async (req, res) => {
    try {
        if (req.body.studentId) {
            const student = await Student.findById(req.body.studentId);
            if (!student) {
                return res.status(404).json({ message: 'Estudiante no encontrado' });
            }
        }

        const updatedPayment = await Payment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('studentId', 'name email grade');

        if (!updatedPayment) {
            return res.status(404).json({ message: 'Pago no encontrado' });
        }
        res.json(updatedPayment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete payment
router.delete('/:id', async (req, res) => {
    try {
        const deletedPayment = await Payment.findByIdAndDelete(req.params.id);
        if (!deletedPayment) {
            return res.status(404).json({ message: 'Pago no encontrado' });
        }
        res.json({ message: 'Pago eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get student payment summary
router.get('/student/:studentId/summary', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);
        if (!student) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }

        const summary = await Payment.getStudentPayments(req.params.studentId);
        res.json({
            student: {
                name: student.name,
                email: student.email,
                grade: student.grade
            },
            payments: summary
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get payments summary by date range
router.get('/summary/range', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Se requieren fechas de inicio y fin' });
        }

        const summary = await Payment.getPaymentsSummary(startDate, endDate);

        // Calculate totals
        const totals = summary.reduce((acc, curr) => {
            acc.total += curr.total;
            acc.count += curr.count;
            return acc;
        }, { total: 0, count: 0 });

        res.json({
            period: { startDate, endDate },
            summary,
            totals
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update payment status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Pagado', 'Pendiente', 'Cancelado'].includes(status)) {
            return res.status(400).json({ message: 'Estado de pago inválido' });
        }

        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Pago no encontrado' });
        }

        payment.status = status;
        const updatedPayment = await payment.save();
        res.json(updatedPayment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 