require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// Import PrismaClient from the generated client
const { PrismaClient } = require('../src/generated/prisma');

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
    console.log('Priority:', task.priority);
  } catch (error) {
    console.error('❌ Error creating dummy task:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addDummyTask();
