var hbs = require('hbs');
var numeral = require('numeral');
var moment = require('moment');
var fs = require('fs-extra');


// register a helper for template format currency
hbs.registerHelper('formatCurrency', function(field) {
  return numeral(field).format('$0,0.00');
});


function formatDate(field){
  var date = new Date(field);
  return moment(date).format('MM/DD/YYYY');
}

// register a helper for template format date
hbs.registerHelper('formatDate', function(field) {
  return formatDate(field);
});

// register a helper to change size of google profile photo
hbs.registerHelper('gphoto', function(url) {
  return url.replace('?sz=50', '')
});

// register a helper to aggregate a field
hbs.registerHelper('sum', function(rows, field) {
  let sum = rows.reduce((p, c) => {
    return p + Number(c[field]) || 0
  },0)

  var sumField =
    `<div class="slds-col slds-grid">
       <div class="slds-col--padded slds-text-heading--label slds-text-align--right slds-size--5-of-12">${field.replace('__c','').toUpperCase()}:</div>
       <div class="slds-col--padded slds-text-body--regular slds-size--7-of-12">${numeral(sum).format('$0,0.00')}</div>
    </div>`

   return new hbs.SafeString(sumField);
});

hbs.registerHelper('detailField', function(label, field) {

  if (label.toLowerCase().indexOf('email') != -1) {
    field = "<a href='mailto:" + field + "'>" + field + "</a>"
  }

var detailField =
  `<div class="slds-col slds-grid">
     <div class="slds-col--padded slds-text-heading--label slds-text-align--right slds-size--5-of-12">${label}:</div>
     <div class="slds-col--padded slds-text-body--regular slds-size--7-of-12">${field}</div>
  </div>`

    return new hbs.SafeString(detailField);
})

hbs.registerHelper('laptopTableHeading', function(dataField, label) {

  var laptopTableHeading =
 `<th class="slds-is-sortable" scope="col" data-field="${dataField}" data-order='ASC'>`+
   `<div class="slds-text-heading--label">${label}`+
      `<button class="slds-button slds-button--icon-bare">`+
       `<svg aria-hidden="true" class="slds-button__icon slds-button__icon--small">`+
         `<use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#arrowup"></use>`+
       `</svg>`+
       `<span class="slds-assistive-text">Sort</span>`+
     `</button>`+
   `</div>`+
 `</th>`


   return new hbs.SafeString(laptopTableHeading);
});


// register a helper for a generic table
hbs.registerHelper('genericTable', function(tableData) {
  var title = Object.keys(tableData)[0];
  var headings = Object.keys(tableData[title][0]);

  var tableHeadings = headings.reduce((p, c, i, keys) => {
    return `${p}<th class='slds-text-heading--label slds-is-sortable${c === 'id' ? ' is-sorted' : ''} slds-size--1-of-${keys.length}' data-field='${c.trim()}' data-order='ASC'>`+
     `<div class="slds-text-heading--label">${c.replace("__c",'')}`+
        `<button class="slds-button slds-button--icon-bare">`+
         `<svg aria-hidden="true" class="slds-button__icon slds-button__icon--small">`+
           `<use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#arrowup"></use>`+
         `</svg>`+
         `<span class="slds-assistive-text">Sort</span>`+
       `</button>`+
     `</div>`+
    `</th>${i != keys.length ? '\n' : ''}`
  }, '');

  var rowCells = (row) => {
    return headings.reduce((p, c, i, keys) => {
      return `${p}<td class='slds-cell-wrap' data-field='${c}'>`+
        `${c ==='id' ? "<a href='/admin/student/" + row.id + "'>" : ''}`+
          `${!row[c] ? '' : (c.toLowerCase().indexOf('date') != -1 || c.toLowerCase().indexOf('start') != -1 || c.toLowerCase().indexOf('end') != -1) ? formatDate(row[c]) : row[c]}`+
        `${c ==='id' ? "</a>" : ''}`+
      `</td>${i != keys.length ? '\n' : ''}`
    }, '')
  }


  var tableRows = tableData[title].reduce((p, c, i, rows) => {
    return `${p}<tr id=${c.id}>\n${rowCells(c)}\n</tr>${i != rows.length ? '\n' : ''}`
  }, '')

  var renderedTable =

    `<div class='slds-scrollable--x'>
      <table class='slds-table slds-table--bordered slds-max-medium-table--stacked-horizontal slds-no-row-hover slds-m-top--medium' id='${title}-table'>
         <thead>
           </tr>
             ${tableHeadings}
           </tr>
         <thead>
         <tbody>
           ${tableRows}
         </tbody>
         <script>window.${title} = ${JSON.stringify(tableData[title])}</script>
       </table>
     </div>`

 return new hbs.SafeString(renderedTable);
});

hbs.registerHelper('endDate', function(record) {
  var endDate = new Date(2016, 0, 28);
  switch (record.status__c) {
    case 'Active':
    case 'Leave of Absence':
      break;
    case 'Completed':
      endDate = record.end_date__c;
      break;
    case 'Withdrawal':
      endDate = record.status_start_date__c;
      break;
    default:
      endDate = record.end_date__c;
  }
  return moment(endDate).format('MM/DD/YYYY');
});

hbs.registerHelper('html', function(field) {
  return new hbs.SafeString(field);
});
