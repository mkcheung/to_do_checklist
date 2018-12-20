require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

let { mongoose } = require('./db/mongoose');
let { Todo } = require('./models/todo');
let { User } = require('./models/user');
let { authenticate } = require('./middleware/authenticate');

let app = express();

app.listen(process.env.PORT, () => {
	console.log(`Listening on port ${process.env.PORT}`);
});

app.use(bodyParser.json());

app.get('/todos', authenticate, (req, res) => {

	Todo.find({
		_creator: req.user._id
	}).then((todos) => {
		res.send({
			todos
		});
	}, (e) => {
		res.status(400).send(e);
	});
});

app.get('/todos/:id', authenticate, (req, res) => {

	let todoId = req.params.id;
	if(!ObjectID.isValid(todoId)){
		res.status(404).send();
	}

	Todo.findOne({
		_id:todoId,
		_creator: req.user._id
	}).then((todo) => {
		if(!todo){
			return res.status(404).send();
		}
		res.send({todo});
	}).catch((e) => {
		res.status(400).send()
	});
	

});

app.post('/todos', authenticate, (req, res) => {
	let newTodo = new Todo({
		text:req.body.text,
		_creator:req.user._id // this was plugged in thanks to the authenticate middleware
	});

	newTodo.save().then((todos) => {
		res.send({todos});
	}, (e) => {
		res.status(400).send(e);
	});
});

app.post('/users', (req, res) => {
	let body = _.pick(req.body, ['email', 'password']);
	let newUser = new User(body);

	newUser.save().then(() => {
		return newUser.generateAuthToken();
	}).then((token) => {
		res.header('x-auth',token).send({newUser});
	}).catch((e) => {
		res.status(400).send(e);
	});
});

app.get('/users/me', authenticate, (req, res) => { 
	res.send(req.user);
});

app.delete('/users/me/token', authenticate, (req, res) => {
	req.user.removeToken(req.token).then( () => {
		res.status(200).send();
	}, () => {
		res.status(400).send();
	});
});

app.post('/users/login', (req, res) => {
	let body = _.pick(req.body, ['email', 'password']);

	User.findByCredentials(body.email, body.password).then((user) =>{
		return user.generateAuthToken().then((token) => {
			res.header('x-auth',token).send(user);
		});
	}).catch((e) => {
		res.status(400).send(e);
	});
});


app.patch('/todos/:id', authenticate, (req, res) => {
	
	let todoId = req.params.id;
	let body = _.pick(req.body, ['text', 'completed']);


	if(!ObjectID.isValid(todoId)){
		return res.status(404).send();
	}

	if( _.isBoolean(body.completed) && body.completed){
		body.completedAt = new Date().getTime()
	} else {
		body.completed = false;
		body.completedAt = null;
	}

	Todo.findOneAndUpdate(
		{
			_id:todoId,
			_creator:req.user._id,
		}, 
		{$set:body},
		{new:true}
	).then((todo) => {
		if(!todo){
			return res.status(404).send();
		}
		res.send({todo});
	}).catch((e) => {
		
		res.status(400).send(e);
	});
});

app.delete('/todos/:id', authenticate, (req, res) => {

	let todoId = req.params.id;
	if(!ObjectID.isValid(todoId)){
		return res.status(404).send();
	}

	Todo.findOneAndRemove({
		_id:todoId,
		_creator:req.user._id
	}).then((todo) => {
		if(!todo){
			return res.status(404).send();
		}
		res.send({todo});
	}).catch((e) => {
		return res.status(400).send(e);
	});
});

module.exports.app = app;

//create new object based on the model
// let newTodo = new Todo({
// 	text:'Make Breakfast',
// 	completed:true
// });
// let newUser = new User({
// 	email:'test@gmail.com',
// 	age:24
// });

//save to the database
// newTodo.save().then((doc) => {
// 	console.log('Todo saved');
// }, (e) => {
// 	console.log('unable to save todo', doc);
// });
// newUser.save().then((doc) => {
// 	console.log('User saved');
// }, (e) => {
// 	console.log('unable to save User', doc);
// });