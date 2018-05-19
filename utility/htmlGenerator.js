



/*
	Function to convert database table of hostel list into a viewable table of html
*/
var generateHostelTable = (body) =>{
	var s1 = "<tr><th>S No.</th><th>Name</th></tr>";
	for(var i = 0; i < body.length; i++) {
		s1 += '<tr>';
		s1 += `<td>${body[i].hid}</td>`;
		s1 += `<td>${body[i].name}</td>`;
		s1 += '</tr>';
	}
	return s1;
}

module.exports = {
	generateHostelTable
}