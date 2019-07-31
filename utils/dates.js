Date.prototype.addDays = function(days) {
	var date = new Date(this.valueOf());
	date.setDate(date.getDate() + days);
	return date;
}

function DateToString(date) {
	var year = date.getFullYear().toString();
	var month = (date.getMonth()+1).toString();
	var date = date.getDate().toString();
	return year+'-'+month+'-'+date;
}

function getDates(startDate, stopDate) {
	var dateArray = new Array();
	var currentDate = startDate;
	while (currentDate <= stopDate) {
		dateArray.push(DateToString(currentDate));
		currentDate = currentDate.addDays(1);
	}
	return dateArray;
}

function createEmptySchedule(startDate, endDate) {
	var schedule = {};
	var dates = getDates(startDate, endDate);
	for (var i=0, day; day = dates[i]; i++) {
		schedule[day] = [];
	}
	return schedule;
}

module.exports = createEmptySchedule;
