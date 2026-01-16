
      INSERT INTO "Task" (id, title, description, "completed", "dueDate", priority, "listName", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        'Sample Task - Welcome to Time Left!',
        'This is a dummy task to get you started. You can edit or delete it.',
        false,
        '2026-01-23T19:23:51.405Z',
        'normal',
        'General',
        NOW(),
        NOW()
      );
    