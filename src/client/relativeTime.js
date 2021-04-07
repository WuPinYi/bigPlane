const dateFormatter = require('./dateFormatter.js');

module.exports = (date) => {
	if(!date)
		return null;
	
	date = new Date(date);

	var deltaSeconds = (Date.now() - date) / 1000;

	var thisWeek = function(date) {
		var getWeekNumber = function() {
			var d = new Date(+this);
			d.setHours(0, 0, 0);
			d.setDate(d.getDate() + 4 - (d.getDay() || 7));
			return Math.ceil((((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
		};
		var thisWeek = getWeekNumber.bind(new Date())(),
			week = getWeekNumber.bind(date)();
		// console.log(thisWeek + '/' + week);
		return thisWeek == week;
	};

	if (deltaSeconds < 60)
		return 'Just now';
	else if (deltaSeconds < 60 * 60) //less than an hour
		return Math.floor(deltaSeconds / 60) + ' minutes ago';
	else if (deltaSeconds < 60 * 60 * 24) //less than a day
		return Math.floor(deltaSeconds / 60 / 60) + ' hours ago';
	else if (deltaSeconds < 60 * 60 * 24 * 2) //less than two day
		return 'Yesterday';
	else if (thisWeek(date))
		return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
	else {
		var yyyy = date.getFullYear().toString();
		var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
		var dd = date.getDate().toString();

		if (new Date().getFullYear() != date.getFullYear())
			// return yyyy + '/' + (mm[1] ? mm : "0" + mm[0]) + '/' + (dd[1] ? dd : "0" + dd[0]) + ''; // padding
			return dateFormatter('F j, Y', date);
		else
			// return (mm[1] ? mm : "0" + mm[0]) + '/' + (dd[1] ? dd : "0" + dd[0]) + ''; // padding
			return dateFormatter('F j', date);
	}
}