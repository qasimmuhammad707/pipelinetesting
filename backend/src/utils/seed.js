import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import Ticket from '../models/Ticket.js';

dotenv.config();

const run = async () => {
  await connectDB();
  console.log('Clearing existing data...');
  await Ticket.deleteMany();
  await Workspace.deleteMany();
  await User.deleteMany();

  console.log('Creating users...');
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@ticketflow.dev',
    password: 'password123',
    role: 'admin',
    avatarColor: '#6366f1',
  });
  const alice = await User.create({
    name: 'Alice Chen',
    email: 'alice@ticketflow.dev',
    password: 'password123',
    avatarColor: '#ec4899',
  });
  const bob = await User.create({
    name: 'Bob Singh',
    email: 'bob@ticketflow.dev',
    password: 'password123',
    avatarColor: '#10b981',
  });

  console.log('Creating workspace...');
  const ws = await Workspace.create({
    name: 'Product Launch',
    description: 'Everything for the Q3 product launch',
    color: '#6366f1',
    owner: admin._id,
    members: [admin._id, alice._id, bob._id],
  });

  console.log('Creating tickets...');
  const tickets = [
    { title: 'Design landing page', status: 'in_progress', priority: 'high', assignees: [alice._id], tags: ['design'] },
    { title: 'Set up CI/CD pipeline', status: 'todo', priority: 'urgent', assignees: [bob._id], tags: ['devops'] },
    { title: 'Write API documentation', status: 'todo', priority: 'medium', assignees: [admin._id], tags: ['docs'] },
    { title: 'Implement auth flow', status: 'in_review', priority: 'high', assignees: [bob._id], tags: ['backend'] },
    { title: 'QA test checkout', status: 'done', priority: 'medium', assignees: [alice._id], tags: ['qa'] },
    { title: 'Plan marketing campaign', status: 'todo', priority: 'low', assignees: [admin._id], tags: ['marketing'] },
  ];

  for (let i = 0; i < tickets.length; i++) {
    await Ticket.create({
      ...tickets[i],
      workspace: ws._id,
      reporter: admin._id,
      order: i,
      description: 'Sample ticket created by the seed script.',
    });
  }

  console.log('\nSeed complete!');
  console.log('Login with: admin@ticketflow.dev / password123');
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
