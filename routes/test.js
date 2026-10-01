const express = require('express');
const router = express.Router();
const Test = require('../models/Test');

// Create a new test
router.post('/', async (req, res) => {
    try {
        const test = new Test(req.body);
        const savedTest = await test.save();
        res.status(201).json(savedTest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all tests
router.get('/', async (req, res) => {
    try {
        const tests = await Test.find();
        res.json(tests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get one test
router.get('/:id', async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        if (test) {
            res.json(test);
        } else {
            res.status(404).json({ message: 'Test not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a test
router.put('/:id', async (req, res) => {
    try {
        const updatedTest = await Test.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedTest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a test
router.delete('/:id', async (req, res) => {
    try {
        await Test.findByIdAndDelete(req.params.id);
        res.json({ message: 'Test deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 