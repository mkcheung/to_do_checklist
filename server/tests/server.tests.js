const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { dummyTodos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('GET /todos', () => {

	it('should return user specific todo documents', (done) => {

		request(app)
			.get('/todos')
	     	.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body.todos.length).toBe(1);
			})
			.end(done);
	});

	it('should return one todo document', (done) => {

		request(app)
			.get(`/todos/${dummyTodos[0]._id.toHexString()}`)
	     	.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(dummyTodos[0].text);
			})
			.end(done);
	});

	it('should not return a todo document created by another user', (done) => {

		request(app)
			.get(`/todos/${dummyTodos[0]._id.toHexString()}`)
	     	.set('x-auth', users[1].tokens[0].token)
			.expect(404)
			.end(done);
	});

	it('should return 404 if not found', (done) => {
		const phonyId = new ObjectID().toHexString;
		request(app)
			.get(`/todos/${phonyId}`)
	     	.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.end(done);
	});

	it('should return 404 for non object ids', (done) => {

		request(app)
			.get(`/todos/123`)
	     	.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.end(done);
	});
});

describe('PATCH /todos', () => {

	it('should update todo text', (done) => {
		let selectedUpdateId = dummyTodos[0]._id.toHexString();
		let text = 'test123';
		let completed = true;

		request(app)
			.patch(`/todos/${selectedUpdateId}`)
	     	.set('x-auth', users[0].tokens[0].token)
			.send({
				text,
				completed
			}) // sends the body expected of a PATCH
			.expect(200)
			.expect((res) => {
				expect(res.body.todo._id).toBe(selectedUpdateId);
				expect(res.body.todo.text).toBe(text);
				expect(res.body.todo.completed).toBe(true);
				expect(typeof res.body.todo.completedAt).toBe('number');
			})
			.end(done);
	});

	it('should not update todo text not owned by user', (done) => {
		let selectedUpdateId = dummyTodos[1]._id.toHexString();
		let text = 'test123';
		let completed = true;

		request(app)
			.patch(`/todos/${selectedUpdateId}`)
	     	.set('x-auth', users[0].tokens[0].token)
			.send({
				text,
				completed
			}) // sends the body expected of a PATCH
			.expect(404)
			.end(done);
	});

	it('should clear out completedAt when incomplete', (done) => {
		let selectedUpdateId = dummyTodos[0]._id.toHexString();
		let text = 'test123';
		let completed = false;

		request(app)
			.patch(`/todos/${selectedUpdateId}`)
	     	.set('x-auth', users[0].tokens[0].token)
			.send({
				text,
				completed
			}) // sends the body expected of a PATCH
			.expect(200)
			.end((err, res) => {
				if(err){
					return done(err);
				}
				expect(res.body.todo._id).toBe(selectedUpdateId);
				expect(res.body.todo.text).toBe(text);
				expect(res.body.todo.completed).toBe(false);
				expect(res.body.todo.completedAt).toBeFalsy();
				done();
			});
	});
});

describe('POST /todos', () => {

	// it('should create a new todo document', (done) => {
	// 	let text = 'testing123';

	// 	request(app)
	// 		.post('/todos')
	//      .set('x-auth', users[0].tokens[0].token)
	// 		.send({
	// 			text
	// 		}) // sends the body expected of a POST
	// 		.expect(200)
	// 		.expect((res) => {
	// 			expect(res.body.text).toBe(text);
	// 		})
	// 		.end((err, res) => { // testing to check if something made it into the db
	// 			if(err){
	// 				return done(err);
	// 			}

	// 			Todo.find({text}).then((todos) => {
	// 				expect(todos.length).toBe(1);
	// 				expect(todos[0].text).toBe(text);
	// 				done();
	// 			}).catch((e) => done(e));
	// 		});
	// });

	it('should not create todo with invalid body data', (done) => {

		request(app)
			.post('/todos')
	     	.set('x-auth', users[0].tokens[0].token)
			.send({}) // sends the body expected of a POST
			.expect(400)
			.end((err, res) => { // testing to check if something made it into the db
				if(err){
					done(err);
				}

				Todo.find().then((todos) => {
					expect(todos.length).toBe(2);
					done();
				}).catch((e) => done(e));
			});
	});
});

describe('DELETE /todos', () => {

	it('should delete one todo document', (done) => {
		let selectedDeleteId = dummyTodos[0]._id.toHexString();
		request(app)
			.delete(`/todos/${selectedDeleteId}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo._id).toBe(selectedDeleteId);
			})
			.end((err, res) => {
				if(err){
					return done(err);
				}
				Todo.findById(selectedDeleteId).then((todo) => {
					expect(todo).toBeFalsy();
					done();
				}).catch((e) => done(e));
			});
	});
	it('should not delete a todo document not owned by the user', (done) => {
		let selectedDeleteId = dummyTodos[0]._id.toHexString();
		request(app)
			.delete(`/todos/${selectedDeleteId}`)
			.set('x-auth', users[1].tokens[0].token)
			.expect(404)
			.end(done);
	});

	it('should return 404 for non object ids', (done) => {

		request(app)
			.delete(`/todos/123`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.end(done);
	});

	it('should return 404 if not found', (done) => {
		const phonyId = new ObjectID().toHexString;
		request(app)
			.delete(`/todos/${phonyId}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.end(done);
	});
});

describe('GET /users/me', () => {

	it('should return the user if it is authenticated', (done) => {
		request(app)
			.get(`/users/me`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body._id).toBe(users[0]._id.toHexString());
				expect(res.body.email).toBe(users[0].email);
			})
			.end(done);
	});

	it('should yield 401 if authentication fails', (done) => {
		
		request(app)
			.get(`/users/me`)
			.set('x-auth', 'dummytoken')
			.expect(401)
			.expect((res) => {
				expect(res.body).toEqual({});
			})
			.end(done);
	});
});

describe('POST /users', () => {

	it('should create a user', (done) => {

		let email = 'dummy@dummy.com';
		let password = '1234556';

		request(app)
			.post(`/users`)
			.send({
				email,
				password
			}) // sends the body expected of a POST
			.expect(200)
			.expect((res) => {
				expect(res.headers['x-auth']).toBeTruthy();
				expect(res.body.newUser._id).toBeTruthy();
				expect(res.body.newUser.email).toBe(email);
			})
			.end(done);
	});

	it('should yield validation errors if request is invalid', (done) => {

		let email = 'du';
		let password = '12';

		request(app)
			.post(`/users`)
			.send({
				email,
				password
			}) // sends the body expected of a POST
			.expect(400)
			.end(done);
	});

	it('should not create a user if there is already another email set in place', (done) => {
		

		let email = 'jackbauer@twentyfour.com';
		let password = '1234556';

		request(app)
			.post(`/users`)
			.send({
				email,
				password
			}) // sends the body expected of a POST
			.expect(400)
			.end(done);
	});
});

describe('POST /users/login', () => {

	it('should login user and return auth token', (done) => {

		let email = users[0].email;
		let password = users[0].password;

		request(app)
			.post(`/users/login`)
			.send({
				email,
				password
			}) // sends the body expected of a POST
			.expect(200)
			.expect((res) => {
				expect(res.headers['x-auth']).toBeTruthy();
				expect(res.body._id).toBeTruthy();
				expect(res.body.email).toBe(email);
			})
			.end((err, res) => {
				if(err){
					return done(err);
				} 

				User.findById(users[0]._id).then((user) => {
					expect(user.toObject().tokens[1]).toMatchObject({
						access:'auth',
						token:res.headers['x-auth']
					});
					done();
				}).catch((e) => done(e));
			});
	});

	it('should reject invalid logins', (done) => {

		let email = 'feafewa';
		let password = users[0].password;

		request(app)
			.post(`/users/login`)
			.send({
				email,
				password
			}) // sends the body expected of a POST
			.expect(400)
			.expect((res) => {
				expect(res.headers['x-auth']).toBeFalsy();
			})
			.end(done);
	});
});

describe('DELETE /users/me/login', () => {

	it('should remove auth token on logout', (done) => {

		let email = users[0].email;
		let password = users[0].password;

		request(app)
			.delete(`/users/me/token`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.end((err, res) => {
				if(err){
					return done(err);
				} 

				User.findById(users[0]._id).then((user) => {
					expect(user.tokens.length).toBe(0);
					done();
				}).catch((e) => done(e));
			});
	});
});