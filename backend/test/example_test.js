
const chai = require('chai');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Visitor = require('../models/Visitor');
const { updateVisitor,getVisitors,addVisitor,deleteVisitor, getVisitor } = require('../controllers/visitorController');
const { expect } = chai;


afterEach(() => sinon.restore());

//Add Visitior Function Test
describe('AddVisitor Function Test', () => {

  it('should create a new visitor successfully', async () => {
    
    const req = {
    user: { id: new mongoose.Types.ObjectId() },
    body: { name: "Kat", age: 12, sex: "Female", office: "Accounting" }
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
    expect(arg).to.deep.include({ name: 'Kat', age: 12, sex: 'Female', office: 'Accounting' });

    expect(res.status.calledOnceWith(201)).to.be.true;
    expect(res.json.calledOnceWith(createdVisitor)).to.be.true;

  });

  it('should return 500 if an error occurs', async () => {
    // Stub Visitor.create to throw an error
    sinon.stub(Visitor, 'create').throws(new Error('DB Error'));

    // Mock request data
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { name: "Kat", age: 12, sex: "Female", office: "Budget" }
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

//Update Function Test
describe('Update Function Test', () => {
  it('should update visitor successfully', async () => {
    const visitorId = new mongoose.Types.ObjectId().toString();

    const updatedVisitor = {
      _id: visitorId,
      name: 'New',
      age: 11,
      sex: 'Female',
      office: 'Budget',
    };

    const findOneAndUpdateStub = sinon
      .stub(Visitor, 'findOneAndUpdate')
      .resolves(updatedVisitor);

    const req = {
      user: { id: 'admin1', role: 'admin' }, // admin can update any
      params: { id: visitorId },
      body: { name: 'New', age: 11, office: 'Budget' },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await updateVisitor(req, res);

    expect(findOneAndUpdateStub.calledOnce).to.be.true;
    expect(findOneAndUpdateStub.firstCall.args[0]).to.deep.equal({ _id: visitorId });
    expect(findOneAndUpdateStub.firstCall.args[2]).to.include({
      new: true,
      runValidators: true,
    });

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(updatedVisitor)).to.be.true;
  });

  it('should return 404 if visitor is not found', async () => {
    const visitorId = new mongoose.Types.ObjectId().toString();
    sinon.stub(Visitor, 'findOneAndUpdate').resolves(null);

    const req = {
      user: { id: 'admin1', role: 'admin' },
      params: { id: visitorId },
      body: { office: 'Budget' },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await updateVisitor(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Visitor not found' })).to.be.true;
  });

  it('should return 500 on error', async () => {
    const visitorId = new mongoose.Types.ObjectId().toString();
    sinon.stub(Visitor, 'findOneAndUpdate').throws(new Error('DB Error'));

    const req = {
      user: { id: 'admin1', role: 'admin' },
      params: { id: visitorId },
      body: { office: 'Budget' },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await updateVisitor(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.called).to.be.true;
  });
});

//Get list of visitor entries
describe('GetVisitors Function Test', () => {

  it('should return visitors for the given user', async () => {


    // Mock visitor data
    const visitors = [
      { _id: new mongoose.Types.ObjectId(), name: "Kat", age: 25, sex: "Female", office: "Cashier" },
      { _id: new mongoose.Types.ObjectId(), name: "John", age: 30, sex: "Male", office: "Budget" }
    ];

    // Stub Visitor.find to return mock visitor
    const sortStub = sinon.stub().resolves(visitors)
    const findStub = sinon.stub(Visitor, 'find').returns({sort: sortStub});

    // Mock request & response
    const req = { user: {id: 'admin1', role: 'admin'}};
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getVisitors(req, res);

    // Assertions
    expect(findStub.calledOnceWith({ })).to.be.true;
    expect(sortStub.calledOnceWith({createdAt: -1})).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(visitors)).to.be.true;
  });

it('should return visitors for the given user (non-admin scoped)', async () => {
    const visitors = [
      { _id: new mongoose.Types.ObjectId(), name: 'Kat', age: 25, sex: 'Female', office: 'Cashier'},
    ];

    const sortStub = sinon.stub().resolves(visitors);
    const findStub = sinon.stub(Visitor, 'find').returns({ sort: sortStub });

    const req = { user: { id: 'u1', role: 'visitor' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await getVisitors(req, res);

    expect(findStub.calledOnceWith({ userId: 'u1' })).to.be.true;
    expect(sortStub.calledOnceWith({ createdAt: -1 })).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(visitors)).to.be.true;
  });


  it('should return 500 on error', async () => {
    // Stub Visitor.find to throw an error
    sinon.stub(Visitor, 'find').throws(new Error('DB Error'));

    // Mock request & response
    const req = { user: {id: 'u1', role: 'visitor' }};
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getVisitors(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

  });

});


describe('GetVisitor Function Test', () => {

  it('should return a single visitor with given id', async () => {
    // Mock user ID
    const visitorId = new mongoose.Types.ObjectId().toString();

    // Mock visitor data
    const visitor = 
      { _id: visitorId, name: "Kat", age: "12", sex: "Female", office: "Human Resource"};
    ;

    // Stub Visitor.find to return mock visitors
    const findOneStub = sinon.stub(Visitor, 'findOne').resolves(visitor);

    // Mock request & response
    const req = {  user: { id: 'admin1', role: 'admin' }, params: { id: visitorId } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getVisitor(req, res);

    // Assertions
    expect(findOneStub.calledOnceWith( {_id:visitorId} )).to.be.true;
    expect(res.json.calledWith(visitor)).to.be.true; // No error status should be set
    expect(res.status.calledWith(200)).to.be.true;
  });

  it('should return 500 on error', async () => {
    // Stub Visitor.find to throw an error
    const visitorId = new mongoose.Types.ObjectId().toString();
    const stub = sinon.stub(Visitor, 'findOne').throws(new Error('DB Error'));

    // Mock request & response
    const req = { user: { id: 'admin1', role: 'admin' }, params: { id: visitorId } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getVisitor(req, res);

    // Assertions
    expect(stub.calledOnce).to.be.true;
    expect(res.status.calledOnceWith(500)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.have.property('message', 'DB Error');

  });

});



describe('DeleteVisitor Function Test', () => {

  it('should delete a visitor successfully', async () => {
    // Mock request data
    const visitorId = new mongoose.Types.ObjectId().toString();

    sinon.stub(Visitor, 'findOneAndDelete').resolves({_id: visitorId});

    // Mock response object
    const req = { user: { id: 'admin1', role: 'admin' }, params: { id: visitorId } }; 
    const res = {
      status: sinon.stub().returnsThis(),
      end: sinon.spy(),
      json: sinon.spy()
    };

    // Call function
    await deleteVisitor(req, res);

    // Assertions
    expect(Visitor.findOneAndDelete.calledOnceWith({_id: visitorId})).to.be.true;
    expect(res.status.calledWith(204)).to.be.true;
    expect(res.end.calledOnce).to.be.true;

  });

  it('should return 404 if visitor is not found', async () => {
    // Stub Visitor.findById to return null
    const visitorId = new mongoose.Types.ObjectId().toString();
    sinon.stub(Visitor, 'findOneAndDelete').resolves(null);

    // Mock request data
    const req = { user: { id: 'admin1', role: 'admin' }, params: { id: visitorId } };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteVisitor(req, res);

    // Assertions
    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Visitor not found' })).to.be.true;
  
  });

  it('should return 500 if an error occurs', async () => {
    // Stub Visitor.findById to throw an error
    const visitorId = new mongoose.Types.ObjectId().toString();
    sinon.stub(Visitor, 'findOneAndDelete').throws(new Error('DB Error'));

    // Mock request data
    const req = { user: { id: 'admin1', role: 'admin' }, params: { id: visitorId } };

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

  });

});