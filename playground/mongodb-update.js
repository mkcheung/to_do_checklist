const { MongoClient, ObjectID } = require('mongodb');

//url where db is located - callback after connection
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {

	if(err){
		return console.log('Unable to connect to MongoDB server');
	}

	db.collection('Todos').findOneAndUpdate({
		_id: new ObjectID('5bd76b854ed274f12964266e')
	}, {
		$set:{
			completed:true
		}
	}, {
		returnOriginal:false 
	}).then((result)=>{
		console.log(result)
	});

	db.collection('Users').findOneAndUpdate({
		_id: new ObjectID('5bd76d25e3e08df35ba78bec')
	}, {
		$set:{
			name:'JB'
		},
		$inc:{
			age: 1
		}
	}, {
		returnOriginal:false 
	}).then((result)=>{
		console.log(result)
	});

});