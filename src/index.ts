import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const mongoUri = 'mongodb://localhost:27017/todobd';

mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');

    app.listen(5000, () => {
      console.log('Server running at http://localhost:5000');
    });
  })
  .catch((err) => {
    console.error(' MongoDB connection error:', err);
  });

interface ITodo extends mongoose.Document {
  id: string;
  text: string;
  completed: boolean;
}

const todoSchema = new mongoose.Schema({
  text: String,
  completed: { type: Boolean, default: false },
}, {
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    }
  }
});

const Todo = mongoose.model<ITodo>('Todo', todoSchema);

app.get('/api/todos', async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
});

app.post('/api/todos', async (req, res) => {
  const todo = new Todo({ text: req.body.text });
  await todo.save();
  res.status(201).json(todo);
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { completed: req.body.completed, text: req.body.text },
      { new: true }
    );
    if (todo) {
      res.json(todo);
    } else {
      res.status(404).json({ message: 'Todo not found' });
    }
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ message: 'Failed to update todo' });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    const result = await Todo.findByIdAndDelete(req.params.id);
    if (result) {
      res.status(204).end();
    } else {
      res.status(404).json({ message: 'Todo not found' });
    }
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ message: 'Failed to delete todo' });
  }
});

export default app;