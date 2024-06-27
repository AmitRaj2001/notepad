const path = require("path");

module.exports = {
	// Your existing webpack configuration
	resolve: {
		fallback: {
			util: require.resolve("util/"),
		},
	},
	// Other webpack settings
};
