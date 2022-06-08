const express = require('express')
const { v4: uuidv4 } = require('uuid')
const app = express()

app.use(express.json())

const users = []

function verifyUserExists(req, res, next) {
    const { username } = req.headers
    
    const user = users.find((user) => user.username === username) 

    if (!user) {
        return res.status(404).json({
            error: 'users not found.'
        })
    }
    req.user = user
    return next()
}

app.post('/users', (req, res) => {
    const { name, username } = req.body

    const hasUsername = users.some((user) => user.username === username)
    if (hasUsername) {
      res.status(400).json({
        error: 'user already exists'
      })
    }

    const user = {
        _id: uuidv4(),
        name,
        username,
        todos: [],
        created_at: new Date()
    }

    users.push(user)
    return res.status(201).json(user)
})

app.get('/users', (req, res) => {
    return res.json(users)
})

app.post('/todos', verifyUserExists, (req, res) => {
    const { user } = req
    const { title, deadline } = req.body

    const todo = {
      _id: uuidv4(),
      title,
      deadline: new Date(deadline),
      done: false,
      created_at: new Date()
    }

    user.todos.push(todo);

    return res.status(201).json(todo)
})

app.get('/todos', verifyUserExists, (req, res) => {
  const { user } = req
  return res.json(user.todos)
})

app.put('/todos/:id', verifyUserExists, (req, res) => {
  const { user } = req
  const { id } = req.params

  const todo = user.todos.find((todo) => todo._id === id)
  if (!todo) {
    return res.status(404).json({
      error: 'todo not found'
    })
  }

  const { title, deadline } = req.body
  todo.title = title
  todo.deadline = new Date(deadline)
  return res.status(200).json(todo)

})

app.patch('/todos/:id/done', verifyUserExists, (req, res) => {
  const { user } = req
  const { id } = req.params

  const todo = user.todos.find((todo) => todo._id === id)
  if (!todo) {
    return res.status(404).json({
      error: 'todo not found'
    })
  }

  todo.done = true
  return res.status(200).json(todo)
})

app.delete('/todos/:id', verifyUserExists, (req, res) => {
  const { user } = req
  const { id } = req.params

  const todo = user.todos.find((todo) => todo._id === id)

  if (!todo) {
    return res.status(404).json({
      error: 'todo not found'
    })
  }

  user.todos.splice(todo, 1)
  return res.status(204).send()
})

module.exports = app