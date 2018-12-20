const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');

// let todoId = '5bd79304a65fd304581afff8';

// if(!ObjectId.isValid(todoId)){
// 	console.log('Invalid Id');
// }

// Todo.find({
// 	_id: todoId
// }).then((todos) => {
// 	console.log('Todos: ', todos);
// });

// Todo.findOne({
// 	_id: todoId
// }).then((todo) => {
// 	if(!todo){
// 		return console.log(`Id not found`);
// 	}
// 	console.log('Todo: ', todo);
// });

// Todo.findById(todoId).then((todo) => {
// 	if(!todo){
// 		return console.log(`Id not found`);
// 	}
// 	console.log('Todo: ', todo);
// }).catch((e) => console.log(e));
let userId = '5bd78061c530626023476a06';

User.findById(userId).then((user) => {
	if(!user){
		return console.log(JSON.stringify(user, undefined, 2));
	}
	console.log('User: ', user);
}).catch((e) => console.log(e));