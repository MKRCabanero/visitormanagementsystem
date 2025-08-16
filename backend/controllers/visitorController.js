const mongoose = require('mongoose');
const Visitor = require('../models/Visitor');

const roleOf = (req) =>
  String(req.user?.role || req.user?.userType || req.user?.type || '').toLowerCase()
;

const userIdOf = (req) => req.user?.id || req.user?._id;


// Get list of visitor entries
const getVisitors = async (req, res) => {
  try {
    const role = roleOf(req);
    const query = role === 'admin' ? {} : { userId: userIdOf(req) };
    const visitors = await Visitor.find(query).sort({ createdAt: -1 });
    return res.status(200).json(visitors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get a visitor entry details
const getVisitor = async (req, res) => {
  try {
    
    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({message: 'No visitor record exists'});
    }
      
    const role = roleOf (req);
    const filter = role === 'admin' ? {_id : id} : { _id: id, userId: userIdOf(req) };

    const visitor = await Visitor.findOne(filter);

    if (!visitor) {
        return res.status(404).json({message: 'Visitor not found'});
    }
    return res.status(200).json(visitor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Add a visitor entry
const addVisitor = async (req,res) => {
    try {
        const name = (req.body.name?? '').toString().trim();
        const age = (req.body.age);
        const sex = (req.body.sex);
        const office = (req.body.office?? '').toString().trim();

        if(!name || Number.isNaN(Number(age)) || !sex || !office) {
          return res.status(400).json({message: 'name, age, sex, and office are require fields'});
        }
        const visitors = await Visitor.create({ userId: userIdOf(req), name, age, sex, office });
        return res.status(201).json(visitors);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
};

//Update visitor entry
const updateVisitor = async (req,res) => {

    try {
        const {id} = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(404).json({message: 'No visitor record exists'});
        }
        const patch = {};
        if ('name' in req.body) patch.name = (req.body.name ?? '').toString().trim();
        if ('age' in req.body) patch.age = req.body.age;
        if ('sex' in req.body) patch.sex = req.body.sex;
        if ('office' in req.body) patch.office = (req.body.office ?? '').toString().trim();
        
        const role = roleOf(req);
        const filter = role === 'admin' ? {_id: id} : {_id:id, userId: userIdOf(req)};
        const updatedVisitor = await Visitor.findOneAndUpdate(filter, patch, {
          new: true,
          runValidators: true,
        });

        if (!updatedVisitor) return res.status(404).json({message: 'Visitor not found'});
        return res.status(200).json(updatedVisitor);
    } catch (error) {
      return  res.status(500).json({ message: error.message });
    }
};

//Delete a visitor entry record
const deleteVisitor = async (req,res) => {
try {
  const {id} = req.params;
  if(!mongoose.Types.ObjectId.isValid(id)) {
  return res.status(404).json({message: 'No visitor record exists'});
  }
  const role = roleOf(req);
  const filter = role === 'admin' ? {_id: id} : {_id:id, userId: userIdOf(req)};
  
  const deletedVisitor = await Visitor.findOneAndDelete(filter)
  if (!deletedVisitor) return res.status(404).json({ message: 'Visitor not found' });
  return res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { getVisitors, addVisitor, updateVisitor, deleteVisitor, getVisitor };