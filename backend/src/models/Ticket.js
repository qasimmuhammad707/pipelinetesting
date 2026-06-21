import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'in_review', 'done'],
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String }],
    dueDate: { type: Date, default: null },
    order: { type: Number, default: 0 },
    comments: [commentSchema],
  },
  { timestamps: true }
);

ticketSchema.index({ workspace: 1, status: 1, order: 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
