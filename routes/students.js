const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');

// Create a new student
router.post('/', async (req, res) => {
    try {
        const student = new Student(req.body);
        const savedStudent = await student.save();
        res.status(201).json(savedStudent);
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
            res.status(400).json({ message: 'El correo electrónico ya está registrado' });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

// Get all students with optional filters
router.get('/', async (req, res) => {
    try {
        const { status, grade } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (grade) filter.grade = grade;

        const students = await Student.find(filter);
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get one student
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (student) {
            res.json(student);
        } else {
            res.status(404).json({ message: 'Estudiante no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a student
router.put('/:id', async (req, res) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedStudent) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }
        res.json(updatedStudent);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'El correo electrónico ya está registrado' });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

// Delete a student
router.delete('/:id', async (req, res) => {
    try {
        const studentId = req.params.id;

        // Verify if student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }

        // Delete attendance records
        const deletedAttendance = await Attendance.deleteMany({ studentId: studentId });

        // Delete payment records
        const deletedPayments = await Payment.deleteMany({ studentId: studentId });

        // Delete the student
        await Student.findByIdAndDelete(studentId);

        res.json({
            success: true,
            message: 'Estudiante y todos sus datos relacionados eliminados exitosamente',
            summary: {
                attendanceRecordsDeleted: deletedAttendance.deletedCount,
                paymentRecordsDeleted: deletedPayments.deletedCount
            }
        });
    } catch (error) {
        console.error('Error al eliminar estudiante:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get students by status
router.get('/status/:status', async (req, res) => {
    try {
        const students = await Student.find({ status: req.params.status });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * DELETE /api/students/:id/cascade
 * Elimina un estudiante y todos sus datos relacionados (asistencias y pagos)
 */
router.delete('/:id/cascade', async (req, res) => {
    try {
        const studentId = req.params.id;

        // Verificar si el estudiante existe
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        // Eliminar registros de asistencia
        const deletedAttendance = await Attendance.deleteMany({ studentId: studentId });
        console.log('Registros de asistencia eliminados:', deletedAttendance.deletedCount);

        // Eliminar registros de pagos
        const deletedPayments = await Payment.deleteMany({ studentId: studentId });
        console.log('Registros de pagos eliminados:', deletedPayments.deletedCount);

        // Eliminar el estudiante
        const deletedStudent = await Student.findByIdAndDelete(studentId);

        res.json({
            success: true,
            message: 'Estudiante y todos sus datos relacionados eliminados exitosamente',
            deletedStudent: student,
            summary: {
                attendanceRecordsDeleted: deletedAttendance.deletedCount,
                paymentRecordsDeleted: deletedPayments.deletedCount
            }
        });

    } catch (error) {
        console.error('Error en eliminación en cascada:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el estudiante y sus datos relacionados',
            error: error.message
        });
    }
});

module.exports = router; 