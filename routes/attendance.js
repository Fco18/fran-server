const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// Create a new attendance record
router.post('/', async (req, res) => {
    try {
        // Verify if student exists
        const student = await Student.findById(req.body.studentId);
        if (!student) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }

        const attendance = new Attendance(req.body);
        const savedAttendance = await attendance.save();
        res.status(201).json(savedAttendance);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({
                message: 'Ya existe un registro de asistencia para este estudiante en esta fecha'
            });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

// Get all attendance records with optional filters
router.get('/', async (req, res) => {
    try {
        const { studentId, date, status } = req.query;
        const filter = {};

        if (studentId) filter.studentId = studentId;
        if (date) filter.date = date;
        if (status) filter.status = status;

        const attendance = await Attendance.find(filter)
            .populate('studentId', 'name email grade') // Include student details
            .sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get attendance by ID
router.get('/:id', async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id)
            .populate('studentId', 'name email grade');
        if (attendance) {
            res.json(attendance);
        } else {
            res.status(404).json({ message: 'Registro de asistencia no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update attendance record
router.put('/:id', async (req, res) => {
    try {
        if (req.body.studentId) {
            // Verify if student exists when updating studentId
            const student = await Student.findById(req.body.studentId);
            if (!student) {
                return res.status(404).json({ message: 'Estudiante no encontrado' });
            }
        }

        const updatedAttendance = await Attendance.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('studentId', 'name email grade');

        if (!updatedAttendance) {
            return res.status(404).json({ message: 'Registro de asistencia no encontrado' });
        }
        res.json(updatedAttendance);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({
                message: 'Ya existe un registro de asistencia para este estudiante en esta fecha'
            });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

// Delete attendance record
router.delete('/:id', async (req, res) => {
    try {
        const deletedAttendance = await Attendance.findByIdAndDelete(req.params.id);
        if (!deletedAttendance) {
            return res.status(404).json({ message: 'Registro de asistencia no encontrado' });
        }
        res.json({ message: 'Registro de asistencia eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get attendance records by date range
router.get('/range/:startDate/:endDate', async (req, res) => {
    try {
        const { startDate, endDate } = req.params;
        const attendance = await Attendance.find({
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate('studentId', 'name email grade')
            .sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get attendance statistics for a student
router.get('/stats/student/:studentId', async (req, res) => {
    try {
        const stats = await Attendance.aggregate([
            { $match: { studentId: req.params.studentId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 