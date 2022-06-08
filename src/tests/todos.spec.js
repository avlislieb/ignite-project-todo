const request = require('supertest')
const { validate } = require('uuid')

const app = require('../')

const MOCK_USER = {
  name: 'danilo andre',
  username: 'dre'
}

const MOCK_TODO = {
  title: 'task one',
  deadline: '2022-05-01'
}

let ID_TODO_CREATED = ''

describe('todos',  () => {
  beforeAll(async ()=>{
    await request(app)
      .post('/users')
      .send(MOCK_USER)

    const response = await request(app)
      .post('/todos')
      .set('username', MOCK_USER.username)
      .set('Content-Type', 'application/json')

    ID_TODO_CREATED = response._body._id
  })

  it('listar todos', async () => {
    const netTodo = {
      ...MOCK_TODO, title: 'new todo'
    }

    const responseStoreTodo = await request(app)
      .post('/todos')
      .set('username', MOCK_USER.username)
      
    const responseIndexTodo = await request(app)
      .get('/todos')
      .set('username', MOCK_USER.username)

    expect(responseIndexTodo._body).toEqual(
      expect.arrayContaining([
        responseStoreTodo._body
      ])
    )
  })

  it('deve ser capaz de criar uma todo', async () => {

    const response = await request(app)
      .post('/todos')
      .set('username', MOCK_USER.username)
      .set('Content-Type', 'application/json')
      .send(MOCK_TODO)
      .expect(201)

      expect(validate(response._body._id)).toBe(true)
      const expected = {
        ...MOCK_TODO, deadline: new Date(MOCK_TODO.deadline).toISOString(), done: false
      }

      expect(response._body).toMatchObject(expected)
      expect(response._body.created_at).toBeTruthy()
  })

  it('deve ser capaz de atualizar uma todo', async () => {
    const responseNewTodo = await request(app)
    .post('/todos')
    .set('username', MOCK_USER.username)
    .send(MOCK_TODO)

    const todoUpdated = {
      ...responseNewTodo._body, title: 'todo updated'
    }  

    const response = await request(app)
      .put(`/todos/${responseNewTodo._body._id}`)
      .set('username', MOCK_USER.username)
      .send(todoUpdated)

    expect(response.statusCode).toBe(200)

    const responseAllTodo = await request(app)
    .get(`/todos`)
    .set('username', MOCK_USER.username)

    expect(responseAllTodo._body).toEqual(
      expect.arrayContaining([
        response._body
      ])
    )
  })

  it('seve ser possivel marcar todo como feita', async () => {
    const responseNewTodo = await request(app)
    .post('/todos')
    .set('username', MOCK_USER.username)
    .send(MOCK_TODO)

    const response = await request(app)
      .patch(`/todos/${responseNewTodo._body._id}/done`)
      .set('username', MOCK_USER.username)
    expect(response.statusCode).toBe(200)
    expect(response._body).toMatchObject({
      ...response._body, done: true
    })
  })

  it('não deve ser possibel marcar todo inexistente como feita', async () => {

    const response = await request(app)
      .patch(`/todos/invalid_id/done`)
      .set('username', MOCK_USER.username)
      .expect(404)
    
  })


  it('não deve ser capaz de criar uma todo com username não criado', async () => {
    const response = await request(app)
      .post('/todos')
      .set('username', 'username_invalido')
      .set('Content-Type', 'application/json')
      .send(MOCK_TODO)
      .expect(404)
  })

  it('deve ser capaz de deletar uma todo existente', async () => {
    const response = await request(app)
      .delete(`/todos/${ID_TODO_CREATED}`)
      .set('username', MOCK_USER.username)
      .expect(204)
  })

  it('não deve ser capaz de deletar uma todo não existente', async () => {
    const response = await request(app)
      .delete(`/todos/id_invalido`)
      .set('username', MOCK_USER.username)
      .expect(404)
  })
  
  it('não deve ser capaz de deletar uma todo com username invalido', async () => {
    const response = await request(app)
      .delete(`/todos/id_invalido`)
      .set('username', 'username_invalido')
      .expect(404)
  })
  
  // it('')

})