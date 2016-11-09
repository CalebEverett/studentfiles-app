//handle search
document.getElementById('search-table').addEventListener('input', event => {
	let searchText = event.target.value;
	const highlightedData = contactData.map(row => {
    Object.key

  const filteredData = contactData.filter(row => {
		console.log(row);
		return Object.keys(row).filter(key => {
			return row[key] ? row[key].indexOf(searchText) != -1 : false;
		}).length > 0
	});
	renderTable('contact-table', filteredData)
})

