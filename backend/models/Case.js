const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, required: true, index: true },
  status: { 
    type: String, 
    enum: ['Registered', 'Under Investigation', 'Closed', 'Cold Case'],
    default: 'Registered'
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number], // [longitude, latitude]
    address: String
  },
  agency: { type: String, required: true },
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  entities: [{
    type: { type: String, enum: ['Person', 'Vehicle', 'Phone', 'Location'] },
    value: String,
    metadata: Object
  }],
  evidence: [{
    fileUrl: String,
    fileType: String,
    uploadedAt: Date
  }],
  timeline: [{
    action: String,
    timestamp: Date,
    user: String
  }]
}, { timestamps: true });

// Geospatial index for location searches
CaseSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Case', CaseSchema);
