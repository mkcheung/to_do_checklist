const { MongoClient, ObjectID } = require('mongodb');
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {

	if(err){
		return console.log('Unable to connect to MongoDB server');
	}
	
	db.collection('Todos').find({_id:new ObjectID('5bd76b854ed274f12964266e')}).toArray().then((docs) => {
		console.log(JSON.stringify(docs, undefined, 2));
	}, (err) => {
		console.log('Unable to find Todos', err);
	});

	db.collection('Todos').find().count().then((count) => {
		console.log(`Todos count: ${count}`);
	}, (err) => {
		console.log('Unable to find Todos', err);
	});

});