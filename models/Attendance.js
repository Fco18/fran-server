const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'El ID del estudiante es requerido']
    },
    date: {
        type: String,
        required: [true, 'La fecha es requerida'],
        validate: {
            validator: function (v) {
                return /^\d{4}-\d{2}-\d{2}$/.test(v);
            },
            message: props => `${props.value} no tiene el formato YYYY-MM-DD!`
        }
    },
    status: {
        type: String,
        required: [true, 'El estado de asistencia es requerido'],
        enum: {
            values: ['Presente', 'Ausente', 'Retardo'],
            message: '{VALUE} no es un estado válido'
        }
    },
    notes: {
        type: String
    }
}, {
    timestamps: true // This will automatically add createdAt and updatedAt fields
});

// Compound index to prevent duplicate attendance records for the same student on the same date
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema); 