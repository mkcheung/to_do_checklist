const { MongoClient, ObjectID } = require('mongodb');
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
	
	if(err){
		return console.log('Unable to connect to MongoDB server');
	}

	db.collection('Todos').insertOne({
		text: 'Something to do',
		completed: false
	}, (err, res)=>{
		if(err){
			return console.log('Could not insert Todo Document');
		}

		console.log(JSON.stringify(res.ops, undefined, 2));
	});

	db.collection('Users').insertOne({
		name: 'Hiryu',
		age: 38,
		location: 'SoCal'
	}, (err, res)=>{
		if(err){
			return console.log('Could not insert User Document');
		}

		console.log(JSON.stringify(res.ops, undefined, 2));
	});
});