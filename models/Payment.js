const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'El ID del estudiante es requerido']
    },
    amount: {
        type: Number,
        required: [true, 'El monto es requerido'],
        validate: {
            validator: function (v) {
                return v > 0;
            },
            message: 'El monto debe ser mayor a 0'
        }
    },
    date: {
        type: String,
        required: [true, 'La fecha es requerida'],
        validate: {
            validator: function (v) {
                return /^\d{4}-\d{2}-\d{2}$/.test(v);
            },
            message: props => `${props.value} no tiene el formato YYYY-MM-DD!`
        },
        default: () => new Date().toISOString().split('T')[0]
    },
    concept: {
        type: String,
        required: [true, 'El concepto es requerido']
    },
    status: {
        type: String,
        required: [true, 'El estado es requerido'],
        enum: {
            values: ['Pagado', 'Pendiente', 'Cancelado'],
            message: '{VALUE} no es un estado válido'
        },
        default: 'Pendiente'
    },
    paymentMethod: {
        type: String,
        required: [true, 'El método de pago es requerido'],
        enum: {
            values: ['Efectivo', 'Tarjeta', 'Transferencia'],
            message: '{VALUE} no es un método de pago válido'
        }
    },
    receiptNumber: {
        type: String,
        unique: true,
        sparse: true
    }
}, {
    timestamps: true
});

// Middleware para generar número de recibo automáticamente
paymentSchema.pre('save', async function (next) {
    if (this.isModified('status') && this.status === 'Pagado' && !this.receiptNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');

        // Encontrar el último número de recibo del mes actual
        const lastPayment = await this.constructor.findOne({
            receiptNumber: new RegExp(`^${year}${month}`)
        }).sort({ receiptNumber: -1 });

        let sequence = 1;
        if (lastPayment && lastPayment.receiptNumber) {
            sequence = parseInt(lastPayment.receiptNumber.slice(-4)) + 1;
        }

        this.receiptNumber = `${year}${month}${String(sequence).padStart(4, '0')}`;
    }
    next();
});

// Método estático para obtener el total de pagos por estudiante
paymentSchema.statics.getStudentPayments = async function (studentId) {
    return this.aggregate([
        { $match: { studentId: mongoose.Types.ObjectId(studentId) } },
        {
            $group: {
                _id: '$status',
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        }
    ]);
};

// Método estático para obtener el resumen de pagos por período
paymentSchema.statics.getPaymentsSummary = async function (startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: {
                    status: '$status',
                    paymentMethod: '$paymentMethod'
                },
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        }
    ]);
};

module.exports = mongoose.model('Payment', paymentSchema); 