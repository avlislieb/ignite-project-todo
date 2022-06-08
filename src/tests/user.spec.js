const request = require('supertest')
const { validate } = require('uuid')

const app = require('../')

const URL_BASE = '/users'
const MOCK_USER = {
  name : "Danilo Vieira",
  username : "dan"
}

describe('users', () => {
  it('deve ser capaz de criar um user', async () => {

    const response = await request(app)
      .post(URL_BASE)
      .send(MOCK_USER)

    expect(response.statusCode).toBe(201);
    expect(validate(response._body._id)).toBe(true);
    expect(response._body).toMatchObject(MOCK_USER)
  })


  it('não deve ser capaz de criar um user com mesmo user name', async () => {

    const user = {
      ...MOCK_USER, username: 'danilo'
    }
    
    await request(app)
      .post(URL_BASE)
      .send(user)
      .expect(201)
      


    const response = await request(app)
      .post(URL_BASE)
      .send(user)
      .expect(400)
      
    expect(response._body.error).toBeTruthy()
  })


})