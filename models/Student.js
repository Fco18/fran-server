const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es requerido']
    },
    email: {
        type: String,
        required: [true, 'El correo electrónico es requerido'],
        unique: true,
        validate: {
            validator: function (v) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
            },
            message: props => `${props.value} no es un correo electrónico válido!`
        }
    },
    phone: {
        type: String
    },
    grade: {
        type: String,
        required: [true, 'El grado escolar es requerido']
    },
    status: {
        type: String,
        enum: {
            values: ['Activo', 'Inactivo', 'Suspendido'],
            message: '{VALUE} no es un estado válido'
        },
        default: 'Activo'
    },
    enrollmentDate: {
        type: String,
        validate: {
            validator: function (v) {
                return /^\d{4}-\d{2}-\d{2}$/.test(v);
            },
            message: props => `${props.value} no tiene el formato YYYY-MM-DD!`
        }
    }
}, {
    timestamps: true // This will automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model('Student', studentSchema); 