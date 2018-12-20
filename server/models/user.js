const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
	email:{
		type:String,
		required:true,
		minlength:1,
		trim: true,
		unique: true,
		validate: {
			validator: validator.isEmail,
			message: '{VALUE} is not a valid email'
		}
	},
	age:{
		type:Number,
		default: null
	},
	password:{
		type:String,
		required:true,
		minlength:6,
	},
	tokens: [{
		access: {
			type:String,
			required:true
		},
		token: {
			type:String,
			required:true
		}
	}]
});

UserSchema.methods.toJSON = function () {
	let user = this;
	let userObject = user.toObject();

	return _.pick(userObject, ['_id', 'email']);
};

UserSchema.statics.findByToken = function (token) {
	let User = this;
	let decoded; 

	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET);
	} catch (e) {
		return Promise.reject('testing');
	}

	return User.findOne({
		'_id': decoded._id,
		'tokens.token':token,
		'tokens.access': 'auth'
	});
};


UserSchema.statics.findByCredentials = function (email, password) {
	let User = this;

	return User.findOne({
		email
	}).then( (user) => {
		if (!user){
			return Promise.reject();
		}
		return new Promise((resolve, reject) => {

			//password hash for new users is currently inoperative
			// bcrypt.compare(password, hashedPw, (err, res) => {
			// 	console.log(res);
			// });

			// bcrypt.compare(password, user.password, (err, res) => {
			// 	if (res) {
			// 		console.log('ste');
			// 		resolve(user);
			// 	} else {
			// 		reject();
			// 	}
			// });

			if(password === user.password){
				resolve(user);
			} else {
				reject();
			}

		});
	});
};

// hash passwords before save - use mongoose middleware
UserSchema.pre('save', function(next){
	let user = this;

	if(user.isModified('password')){
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(user.password, salt, (err, hash) => {
				user.password = hash;
				next();
			})
		});
		next();
	} else {
		next();
	}
});

UserSchema.methods.generateAuthToken = function(){
	let user = this;
	let access = 'auth';
	let token = jwt.sign({
		_id: user._id.toHexString(), 
		access
	}, process.env.JWT_SECRET).toString();

	user.tokens = user.tokens.concat([
		{
			access,
			token
		}
	]);

	return user.save().then(() => {
		return token;
	});
}

UserSchema.methods.removeToken = function(token){

	let user = this;

	return user.update({
		$pull: {
			tokens:{token}
		}
	});
}

const User = mongoose.model('User', UserSchema);

module.exports = {
	User
};