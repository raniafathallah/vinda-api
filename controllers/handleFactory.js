const APIFeatures = require("../utils/apiFeatures.js");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const generateToken = require("../utils/generateToken.js");

// Factory Method to return GET request handler for all documents from collection
exports.getAllFactory = (Model) =>
	catchAsync(async (req, res, next) => {
		// -> Checking if request came from GET /tours/:tourId/reviews
		let filter = {};
		// if (req.params.tourId) filter = { tour: req.params.tourId };

		// -> Building Query
		const features = new APIFeatures(Model.find(filter), req.query)
			.filter()
			.sort()
			.chooseFields()
			.paginate();

		// -> Executing Query
		const document = await features.query;

		// 200: OK Response
		res.status(200).send({
			status: "success",
			results: document.length,
			data: {
				data: document,
			},
		});
	});

// Factory Method to return GET request handler for only one resource
exports.getOneFactory = (Model, populateOptions) =>
	catchAsync(async (req, res, next) => {
		let query = Model.findById(req.user.id);
		// Populated the Referenced Users which are guides for this tour if options are passed in
		if (populateOptions) query = query.populate(populateOptions);
		const document = await query;

		// Jump to the global Error Handler if no document is found
		if (!document) {
			return next(new AppError("No Such Data exists", 404));
		}

		// Response 200: OK
		res.status(200).json({
			status: "success",
			data: {
				data: document,
				token:generateToken(req.user.id)
			},
		});
	});

// Factory Method to return POST request handler.
exports.createFactory = (Model) =>
	catchAsync(async (req, res, next) => {
		// Creating a new Tour in MongoDB
		const newDocument = await Model.create(req.body);

		// Response 201: Created
		res.status(201).json({
			status: "success",
			data: {
				data: newDocument,
			},
		});
	});

// Factory Method to return UPDATE request handler.
exports.updateFactory = (Model) =>
	catchAsync(async (req, res, next) => {
		const document = await Model.findByIdAndUpdate(
			req.body.id,
			req.body,
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

// Factory Method to return DELETE request handler.
exports.deleteFactory = (Model) =>
	catchAsync(async (req, res, next) => {
		const document = await Model.findByIdAndDelete(req.params.id);

		// Jump to the global Error Handler if no document is found
		if (!document) {
			return next(new AppError("No Such Data exists", 404));
		}

		// Response 204: No Content
		res.status(204).json({
			status: "success",
			data: null,
		});
	});
