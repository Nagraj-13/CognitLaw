import mongoose from "mongoose";
const CaseSchema = new mongoose.Schema({
    caseId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId()},
    lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issue: { type: String, required: true },
    caseStatus: { type: String, enum: ['Open', 'Closed', 'In Progress'], default: 'Open' },
    researchDocuments: [
      {
        fileName: { type: String },
        filePath: { type: String},
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  
export const Case = mongoose.model('Case', CaseSchema);
  