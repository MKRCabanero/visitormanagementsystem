
const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const app = require('../server'); 
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Visitor = require('../models/Visitor');
const { updateVisitor,getVisitors,addVisitor,deleteVisitor, getVisitor } = require('../controllers/visitorController');
const { expect } = chai;

chai.use(chaiHttp);
let server;
let port;

afterEach(() => sinon.restore());

describe('AddVisitor Function Test', () => {

  it('should create a new visitor successfully', async () => {
    
    const req = {
    user: { id: new mongoose.Types.ObjectId() },
    body: { name: "Kat", age: 12, sex: "Female", type: "Walk-in" }
  };
    // Mock Visitor that would be created
    const createdVisitor = { _id: new mongoose.Types.ObjectId(), userId: req.user.id, ...req.body };

    // Stub Visitor.create to return the createdVisitor
    const createStub = sinon.stub(Visitor, 'create').resolves(createdVisitor);

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await addVisitor(req, res);

    // Assertions
    expect(createStub.calledOnce).to.be.true;

    const arg = createStub.firstCall.args[0];
    expect(arg).to.have.property('userId');
    expect(arg).to.deep.include({ name: 'Kat', age: 12, sex: 'Female', type: 'Walk-in' });

    expect(res.status.calledOnceWith(201)).to.be.true;
    expect(res.json.calledOnceWith(createdVisitor)).to.be.true;

  });

  it('should return 500 if an error occurs', async () => {
    // Stub Visitor.create to throw an error
    const createStub = sinon.stub(Visitor, 'create').throws(new Error('DB Error'));

    // Mock request data
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { name: "Kat", age: 12, sex: "Female", type: "Walk-in" }
    };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await addVisitor(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

  });
});


describe('Update Function Test', () => {

  it('should update visitor successfully', async () => {
    // Mock visitor data
    const visitorId = new mongoose.Types.ObjectId();
    const existingVisitor = {
      _id: visitorId,
      name: "Old",
      age: 10,
      sex: "Female",
      type: "Walk-in",
      save: sinon.stub().resolvesThis(), // Mock save method
    };
    // Stub Visitor.findById to return mock visitor
    const findByIdStub = sinon.stub(Visitor, 'findById').resolves(existingVisitor);

    // Mock request & response
    const req = {
      params: { id: visitorId },
      body: { name: "New", age: 11, type: "By Appointment" }
    };
    const res = {
      json: sinon.spy(), 
      status: sinon.stub().returnsThis()
    };

    // Call function
    await updateVisitor(req, res);

    // Assertions
    expect(existingVisitor.name).to.equal("New");
    expect(existingVisitor.age).to.equal(11);
    expect(existingVisitor.type).to.equal("By Appointment");
    expect(res.status.called).to.be.false; // No error status should be set
    expect(res.json.calledOnce).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });



  it('should return 404 if visitor is not found', async () => {
    const findByIdStub = sinon.stub(Visitor, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateVisitor(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Visitor not found' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 500 on error', async () => {
    const findByIdStub = sinon.stub(Visitor, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateVisitor(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.called).to.be.true;

    findByIdStub.restore();
  });



});



describe('GetVisitors Function Test', () => {

  it('should return visitors for the given user', async () => {
    // Mock user ID
    const userId = [{ _id: new mongoose.Types.ObjectId(), name: "Kat" }];

    // Mock visitor data
    const visitors = [
      { _id: new mongoose.Types.ObjectId(), name: "Kat", age: 25, sex: "Female", type: "Walk-in" },
      { _id: new mongoose.Types.ObjectId(), name: "John", age: 30, sex: "Male", type: "By Appointment" }
    ];

    // Stub Visitor.find to return mock visitor
    const sortStub = sinon.stub().resolves(visitors)
    const findStub = sinon.stub(Visitor, 'find').returns({sort: sortStub});

    // Mock request & response
    const req = { };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getVisitors(req, res);

    // Assertions
    expect(findStub.calledOnceWith({ })).to.be.true;
    expect(sortStub.calledOnceWith({createdAt: -1}));
    expect(res.json.calledWith(visitors)).to.be.true;

    // Restore stubbed methods
    findStub.restore();
  });

  it('should return 500 on error', async () => {
    // Stub Visitor.find to throw an error
    const findStub = sinon.stub(Visitor, 'find').throws(new Error('DB Error'));

    // Mock request & response
    const req = { };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getVisitors(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    // Restore stubbed methods
    findStub.restore();
  });

});


describe('GetVisitor Function Test', () => {

  it('should return a single visitor with given id', async () => {
    // Mock user ID
    const visitorId = new mongoose.Types.ObjectId().toString();

    // Mock visitor data
    const visitor = 
      { _id: visitorId, name: "Kat", age: "12", sex: "Female", type: "Walk-in"};
    ;

    // Stub Visitor.find to return mock visitors
    const findByIdStub = sinon.stub(Visitor, 'findById').resolves(visitor);

    // Mock request & response
    const req = { params: { visitorId } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getVisitor(req, res);

    // Assertions
    expect(findByIdStub.calledOnceWith( visitorId )).to.be.true;
    expect(res.status.called).to.be.false; // No error status should be set
    expect(res.json.calledWith(visitor)).to.be.true;
  });

  it('should return 500 on error', async () => {
    // Stub Visitor.find to throw an error
    const visitorId = new mongoose.Types.ObjectId().toString();
    const stub = sinon.stub(Visitor, 'findById').throws(new Error('DB Error'));

    // Mock request & response
    const req = { params: { visitorId } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getVisitor(req, res);

    // Assertions
    expect(stub.calledOnce).to.be.true;
    const arg = stub.firstCall.args[0];
    expect(String(arg)).to.equal(visitorId);

    expect(res.status.calledOnceWith(500)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.have.property('message', 'DB Error');

  });

});



describe('DeleteVisitor Function Test', () => {

  it('should delete a visitor successfully', async () => {
    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock visitor found in the database
    const visitor = { deleteOne: sinon.stub().resolves() };

    // Stub Visitor.findById to return the mock visitor
    const findByIdStub = sinon.stub(Visitor, 'findById').resolves(visitor);

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteVisitor(req, res);

    // Assertions
    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(visitor.deleteOne.calledOnce).to.be.true;
    expect(res.json.calledWith({ message: 'Visitor deleted' })).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });

  it('should return 404 if visitor is not found', async () => {
    // Stub Visitor.findById to return null
    const findByIdStub = sinon.stub(Visitor, 'findById').resolves(null);

    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteVisitor(req, res);

    // Assertions
    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Visitor not found' })).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    // Stub Visitor.findById to throw an error
    const findByIdStub = sinon.stub(Visitor, 'findById').throws(new Error('DB Error'));

    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteVisitor(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });

});