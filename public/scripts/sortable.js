//sort table on heading clicks
const tableHeadings = document.getElementsByClassName('slds-is-sortable');
const upArrow = '/assets/icons/utility-sprite/svg/symbols.svg#arrowup';
const downArrow = '/assets/icons/utility-sprite/svg/symbols.svg#arrowdown';

const renderTable = (tableId, data) => {
  let oldBody = document.getElementById(tableId).getElementsByTagName('tbody')[0];
  let newBody = document.createElement('tbody');
  data.forEach(row => {
  	let newRow = document.createElement('tr');
  	newRow.id = row.id;
  	Object.keys(row).forEach(key => {
  		let newCell = document.createElement('td')
  		newCell.className = 'slds-cell-wrap';
  		if (key === 'id') {
  			let idLink = document.createElement('a');
  			idLink.href = '/admin/student/' + row.id;
  			idLink.innerHTML = row.id;
  			newCell.appendChild(idLink)
  		} else {
  			newCell.innerHTML = !row[key] ? '' : (key.toLowerCase().indexOf('date') != -1 || key.toLowerCase().indexOf('start') != -1 || key.toLowerCase().indexOf('end') != -1) ? new Date(row[key]).toLocaleDateString({}) : row[key];
  		}
  		newRow.appendChild(newCell);
  	})
  	newBody.appendChild(newRow);
  });
  oldBody.parentElement.replaceChild(newBody, oldBody)
}

for (let i = tableHeadings.length - 1; i >= 0; i--) {
  tableHeadings[i].addEventListener('click', event => {
    const getTableId = elem => {
      return elem.nodeName === 'TABLE' ? elem : getTableId(elem.parentElement)
    }
  	let heading = event.currentTarget;
    let table = getTableId(heading);
    let tableData = window[table.id.replace('-table', '')];

  	//hide sort arrow on previous sort
  	table.getElementsByClassName('is-sorted')[0].classList.remove('is-sorted');

  	//get the field to be sorted and the last sort order
  	let field = heading.dataset.field;
  	let lastOrder = heading.dataset.order;

    //sort the array of data passed in from the server on load
    tableData.sort((a,b) => {
      var va = (a[field] === null) ? "" : "" + a[field],
          vb = (b[field] === null) ? "" : "" + b[field];

    	if (lastOrder == 'DESC') {
      	return va < vb ? -1 : va === vb ? 0 : 1;
      } else {
      	return va > vb ? -1 : va === vb ? 0 : 1;
      }
    })

    //create a new table body and replace existing with new
    renderTable(table.id, tableData);

    //update the sort order data field on the heading that the table was sorted by
    heading.dataset.order = lastOrder === 'ASC' ? 'DESC' : 'ASC';
    heading.getElementsByTagName('use')[0].setAttribute('xlink:href', lastOrder === 'DESC' ? upArrow : downArrow);
    heading.classList.add('is-sorted');
  })
}

//expand and collapse table
let visButtons = document.getElementsByClassName('slds-toggle-visibility');
let delay = 5;

for (let i = visButtons.length - 1; i >= 0; i--) {
  visButtons[i].getElementsByTagName('use')[0].style.transformOrigin = '50% 50%';
  visButtons[i].addEventListener('click', event => {
    let rows = document.getElementById(event.currentTarget.dataset.table).getElementsByTagName('TR');
    let hidden = rows[0].classList.contains('slds-hide');
    let buttonIcon = event.currentTarget.getElementsByTagName('use')[0];

    const toggleRow = el => {
      return new Promise((resolve, reject) =>
        setTimeout(() => {
          el.classList.toggle('slds-hide');
          resolve();
        }, delay )
        )
    }

    //hide from the bottom, show from the top
    const toggleAllRows = (index) => {
      if (hidden ? index < rows.length : index > -1) {
        toggleRow(rows[index])
        .then(() => toggleAllRows(hidden ? ++index : --index))
      }
    }

    toggleAllRows(hidden ? 0 : rows.length - 1);
    buttonIcon.style.transition = `${(rows.length -2) * delay }ms ease-in-out`;
    buttonIcon.style.transform = `rotate(${hidden ? '0' : '180'}deg)`;
    //buttonIcon.setAttribute('transform', `rotate(${hidden ? '180' : '0'}, 8, 8)`);
  })
}
