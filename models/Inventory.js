const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre del artículo es requerido']
    },
    category: {
        type: String,
        required: [true, 'La categoría es requerida']
    },
    quantity: {
        type: Number,
        required: [true, 'La cantidad es requerida'],
        min: [0, 'La cantidad no puede ser negativa'],
        validate: {
            validator: Number.isInteger,
            message: 'La cantidad debe ser un número entero'
        }
    },
    location: {
        type: String,
        required: [true, 'La ubicación es requerida']
    },
    status: {
        type: String,
        required: [true, 'El estado es requerido'],
        enum: {
            values: ['Disponible', 'Agotado', 'Bajo stock'],
            message: '{VALUE} no es un estado válido'
        },
        default: 'Disponible'
    },
    lastUpdated: {
        type: String,
        validate: {
            validator: function (v) {
                return !v || /^\d{4}-\d{2}-\d{2}$/.test(v);
            },
            message: props => `${props.value} no tiene el formato YYYY-MM-DD!`
        }
    },
    description: {
        type: String
    },
    serialNumber: {
        type: String
    }
}, {
    timestamps: true // This will automatically add createdAt and updatedAt fields
});

// Middleware to automatically update lastUpdated field
inventorySchema.pre('save', function (next) {
    if (this.isModified('quantity') || this.isModified('status')) {
        this.lastUpdated = new Date().toISOString().split('T')[0];
    }
    next();
});

// Middleware to update status based on quantity
inventorySchema.pre('save', function (next) {
    if (this.quantity === 0) {
        this.status = 'Agotado';
    } else if (this.quantity <= 5) {
        this.status = 'Bajo stock';
    } else {
        this.status = 'Disponible';
    }
    next();
});

module.exports = mongoose.model('Inventory', inventorySchema); 