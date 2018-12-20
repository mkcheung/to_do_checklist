// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

//url where db is located - callback after connection
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {

	if(err){
		return console.log('Unable to connect to MongoDB server');
	}



	console.log('Connected to MongoDB server')
	db.close();
});