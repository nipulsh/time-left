import { PrismaClient } from '../src/generated/prisma';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function addDummyTask() {
  try {
    const task = await prisma.task.create({
      data: {
        title: 'Sample Task - Welcome to Time Left!',
        description: 'This is a dummy task to get you started. You can edit or delete it.',
        completed: false,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        priority: 'normal',
        listName: 'General',
      },
    });

    console.log('✅ Dummy task created successfully!');
    console.log('Task ID:', task.id);
    console.log('Task Title:', task.title);
    console.log('Due Date:', task.dueDate);
  } catch (error) {
    console.error('❌ Error creating dummy task:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addDummyTask();

