const Visitor = require('../models/Visitor');


const getVisitors = async (req, res) => {
  try {
    const role = String(req.user?.role || req.user?.userType || req.user?.type || '').toLowerCase();
    const query = role === 'admin' ? {} : { userId: req.user.id }; // admin = all, others = own
    const visitors = await Visitor.find({query}).sort({ createdAt: -1 });
    res.json(visitors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVisitor = async (req, res) => {
  try {
    const role = String(req.user?.role || req.user?.userType || req.user?.type || '').toLowerCase();
    const query = role === 'admin' ? {} : { userId: req.user.id }; // admin = all, others = own

    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
        return res.status(404).json({message: 'Visitor not found'});
    }
    res.json(visitor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addVisitor = async (req,res) => {
    try {
        const { name, age, sex, office } = req.body;
        const visitors = await Visitor.create({ userId: req.user.id, name, age, sex, office });
        res.status(201).json(visitors);
    } catch (error) {
    res.status(500).json({ message: error.message });
    }
};


const updateVisitor = async (req,res) => {

    try {
        const visitor = await Visitor.findById(req.params.id);
        if (!visitor) return res.status(404).json({ message: 'Visitor not found' });
        
        const { name, age, sex, office } = req.body;
        if (name !== undefined) visitor.name = name;
        if (age !== undefined) visitor.age = age;
        if (sex !== undefined) visitor.sex = sex;
        if (office !== undefined) visitor.office = office;
        
        const updatedVisitor = await visitor.save();
        res.json(updatedVisitor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const deleteVisitor = async (req,res) => {
try {
        const visitor = await Visitor.findById(req.params.id);
        if (!visitor) return res.status(404).json({ message: 'Visitor not found' });
        
        await visitor.deleteOne();
        res.json({ message: 'Visitor deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = { getVisitors, addVisitor, updateVisitor, deleteVisitor, getVisitor };