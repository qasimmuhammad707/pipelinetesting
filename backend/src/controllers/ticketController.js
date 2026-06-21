import Ticket from '../models/Ticket.js';

const populateTicket = (q) =>
  q
    .populate('assignees', 'name email avatarColor')
    .populate('reporter', 'name email avatarColor')
    .populate('comments.author', 'name email avatarColor');

export const createTicket = async (req, res, next) => {
  try {
    const { title, description, workspace, status, priority, assignees, tags, dueDate } = req.body;
    const count = await Ticket.countDocuments({ workspace, status: status || 'todo' });
    const ticket = await Ticket.create({
      title,
      description,
      workspace,
      status: status || 'todo',
      priority: priority || 'medium',
      assignees: assignees || [],
      tags: tags || [],
      dueDate: dueDate || null,
      reporter: req.user._id,
      order: count,
    });
    const populated = await populateTicket(Ticket.findById(ticket._id));
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

export const getTickets = async (req, res, next) => {
  try {
    const { workspace, status, priority, assignee, search } = req.query;
    const filter = {};
    if (workspace) filter.workspace = workspace;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignees = assignee;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const tickets = await populateTicket(Ticket.find(filter)).sort('order createdAt');
    res.json(tickets);
  } catch (err) {
    next(err);
  }
};

export const getTicket = async (req, res, next) => {
  try {
    const ticket = await populateTicket(Ticket.findById(req.params.id));
    if (!ticket) {
      res.status(404);
      throw new Error('Ticket not found');
    }
    res.json(ticket);
  } catch (err) {
    next(err);
  }
};

export const updateTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      res.status(404);
      throw new Error('Ticket not found');
    }
    const fields = ['title', 'description', 'status', 'priority', 'assignees', 'tags', 'dueDate', 'order'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) ticket[f] = req.body[f];
    });
    await ticket.save();
    const populated = await populateTicket(Ticket.findById(ticket._id));
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

export const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      res.status(404);
      throw new Error('Ticket not found');
    }
    await ticket.deleteOne();
    res.json({ message: 'Ticket deleted' });
  } catch (err) {
    next(err);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      res.status(404);
      throw new Error('Ticket not found');
    }
    ticket.comments.push({ author: req.user._id, body: req.body.body });
    await ticket.save();
    const populated = await populateTicket(Ticket.findById(ticket._id));
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};
