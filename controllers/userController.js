const User = require("../models/User");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handleFactory");

// ------------- Admin Restricted Routes -------------
// POST Request to create new user
exports.createUser = (req, res) => {
	// 400: Bad Request
	res.status(200).json({
		status: "fail",
		message:
			"This route is not implemented! Please use /sign-up to create a new user",
	});
};

// GET Request to retrieve all users from DB
exports.getAllUsers = factory.getAllFactory(User);

//res.json(await User.find({}).populate("bookings"))
// GET Request to get one user by id
 exports.getUserById = factory.getOneFactory(User);

//this.populate({ path: "bookings", select: "note fromWhere -_id " })
// 	this.populate({ path: "cars", select: "carNumber _id " });
// exports.getUserById = async (req, res) => {
//      res.json(await User.findOne({}).
// 	populate({ path: "bookings", select: "note fromWhere -_id " })
// 	.populate({ path: "cars", select: "carNumber _id " })
// 	)
//  }


// PATCH Request to update a user's data
exports.updateUser = factory.updateFactory(User);

// DELETE Request to delete an user
exports.deleteUser = factory.deleteFactory(User);

// ------------- Utility Functions -------------
// Filter out list of fields specified from object passed in
const filterObject = (object, ...fields) => {
	const newObj = {};
	Object.keys(object).forEach((key) => {
		if (fields.includes(key)) {
			newObj[key] = object[key];
		}
	});
	return newObj;
};




// ------------- Individual User Related Routes -------------
// PATCH Request to update current user's info



exports.updateMe = catchAsync(async (req, res, next) => {

	// -> Decline Request if user tries to update password
	if (req.body.password || req.body.passwordConfirm)
		return next(
			new AppError("You cannot change the password from here!!", 400)
		);

	// -> Filter req.body
	const filtered = filterObject(req.body, "name", "address", "phoneNumber");




	const document = await User.findByIdAndUpdate(
		req.user.id,
		filtered,
		{
			new: true,
			runValidators: true,
		}
	);

	// Jump to the global Error Handler if no document is found
	if (!document) {
		return next(new AppError("No Such document exists", 404));
	}

	// Response 200: OK
	res.status(200).json({
		status: "success",
		data: {
			data: document,
		},
	});
});

// DELETE Request to deactivate current user's account
exports.deleteMe = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, { active: false });
	// 204: No Content
	res.status(204).json({
		status: "success",
	});
});



