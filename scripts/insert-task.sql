INSERT INTO "Task" (id, title, description, "completed", "dueDate", priority, "listName", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Sample Task - Welcome to Time Left!',
  'This is a dummy task to get you started. You can edit or delete it.',
  false,
  NOW() + INTERVAL '7 days',
  'normal',
  'General',
  NOW(),
  NOW()
);

