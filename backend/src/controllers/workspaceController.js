import Workspace from '../models/Workspace.js';
import Ticket from '../models/Ticket.js';

export const createWorkspace = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    const workspace = await Workspace.create({
      name,
      description,
      color,
      owner: req.user._id,
      members: [req.user._id],
    });
    res.status(201).json(workspace);
  } catch (err) {
    next(err);
  }
};

export const getWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await Workspace.find({ members: req.user._id })
      .populate('owner', 'name email avatarColor')
      .populate('members', 'name email avatarColor')
      .sort('-createdAt');
    res.json(workspaces);
  } catch (err) {
    next(err);
  }
};

export const getWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('owner', 'name email avatarColor')
      .populate('members', 'name email avatarColor');
    if (!workspace) {
      res.status(404);
      throw new Error('Workspace not found');
    }
    res.json(workspace);
  } catch (err) {
    next(err);
  }
};

export const updateWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      res.status(404);
      throw new Error('Workspace not found');
    }
    const { name, description, color, members } = req.body;
    if (name !== undefined) workspace.name = name;
    if (description !== undefined) workspace.description = description;
    if (color !== undefined) workspace.color = color;
    if (members !== undefined) workspace.members = members;
    await workspace.save();
    res.json(workspace);
  } catch (err) {
    next(err);
  }
};

export const deleteWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      res.status(404);
      throw new Error('Workspace not found');
    }
    if (workspace.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Only the owner can delete this workspace');
    }
    await Ticket.deleteMany({ workspace: workspace._id });
    await workspace.deleteOne();
    res.json({ message: 'Workspace deleted' });
  } catch (err) {
    next(err);
  }
};
