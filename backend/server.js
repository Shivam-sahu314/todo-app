const dns = require("dns");
dns.setServers(["8.8.8.8"]);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Todo = require("./Todo");

dotenv.config();

const app = express();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error);
    });

app.get("/", (req, res) => {
    res.json({
        message: "Todo App Backend is running"
    });
});

app.get("/todos", async (req, res) => {
    try {
        const todos = await Todo.find();

        res.json(todos);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch todos"
        });
    }
});

app.post("/todos", async (req, res) => {
    const { title } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({
            message: "Title is required"
        });
    }

    try {
        const todo = await Todo.create({
            title: title.trim()
        });

        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({
            message: "Failed to create todo"
        });
    }
});

app.put("/todos/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const todo = await Todo.findById(id);

        if (!todo) {
            return res.status(404).json({
                message: "Todo not found"
            });
        }

        if (req.body.title !== undefined) {
            const title = req.body.title.trim();

            if (title === "") {
                return res.status(400).json({
                    message: "Title cannot be empty"
                });
            }

            todo.title = title;
        }

        if (req.body.completed !== undefined) {
            todo.completed = req.body.completed;
        }

        await todo.save();

        res.json(todo);
    } catch (error) {
        res.status(500).json({
            message: "Failed to update todo"
        });
    }
});

app.delete("/todos/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const todo = await Todo.findByIdAndDelete(id);

        if (!todo) {
            return res.status(404).json({
                message: "Todo not found"
            });
        }

        res.json({
            message: "Todo deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete todo"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});