const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

// Create a new inventory item
router.post('/', async (req, res) => {
    try {
        const inventory = new Inventory(req.body);
        const savedInventory = await inventory.save();
        res.status(201).json(savedInventory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all inventory items with optional filters
router.get('/', async (req, res) => {
    try {
        const { category, status, location } = req.query;
        const filter = {};

        if (category) filter.category = category;
        if (status) filter.status = status;
        if (location) filter.location = location;

        const inventory = await Inventory.find(filter).sort({ category: 1, name: 1 });
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get inventory item by ID
router.get('/:id', async (req, res) => {
    try {
        const inventory = await Inventory.findById(req.params.id);
        if (inventory) {
            res.json(inventory);
        } else {
            res.status(404).json({ message: 'Artículo no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update inventory item
router.put('/:id', async (req, res) => {
    try {
        const updatedInventory = await Inventory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedInventory) {
            return res.status(404).json({ message: 'Artículo no encontrado' });
        }
        res.json(updatedInventory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete inventory item
router.delete('/:id', async (req, res) => {
    try {
        const deletedInventory = await Inventory.findByIdAndDelete(req.params.id);
        if (!deletedInventory) {
            return res.status(404).json({ message: 'Artículo no encontrado' });
        }
        res.json({ message: 'Artículo eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update quantity
router.patch('/:id/quantity', async (req, res) => {
    try {
        const { quantity } = req.body;
        if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 0) {
            return res.status(400).json({ message: 'Cantidad inválida' });
        }

        const inventory = await Inventory.findById(req.params.id);
        if (!inventory) {
            return res.status(404).json({ message: 'Artículo no encontrado' });
        }

        inventory.quantity = quantity;
        const updatedInventory = await inventory.save();
        res.json(updatedInventory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get low stock items
router.get('/status/low-stock', async (req, res) => {
    try {
        const lowStockItems = await Inventory.find({
            status: { $in: ['Agotado', 'Bajo stock'] }
        }).sort({ quantity: 1 });
        res.json(lowStockItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get inventory statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const stats = await Inventory.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalItems: { $sum: '$quantity' }
                }
            }
        ]);

        const categoryStats = await Inventory.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalItems: { $sum: '$quantity' }
                }
            }
        ]);

        res.json({
            statusStats: stats,
            categoryStats: categoryStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 