const app = require('express')()
const { Vendor, Invoice } = require('./db/schema')
const mockData = require('./MOCK_DATA.json')

app.listen(4000, () => {
  console.log('app listening on port 4000')
})

app.get('/api/v1/healthz', (req, res) => {
  res.send('life ok mon')
})

app.post('/api/v1/invoices', (req, res) => {
  const invoices = Vendor.find({})
    .then(vendors => {
      console.log('vendors list', vendors)
      vendors != undefined ? vendors : Promise.reject(response.text()), error =>
        Promise.reject(error)
    })
    .then(vendors => {
      const cleanedVendors = invoicesStructure(vendors)
      res.json({ attachments: cleanedVendors })
    })
})

function invoicesStructure (vendors) {
  console.log(vendors)
  vendors = vendors.toObject()

  const newObject = vendors.forEach(element => {
    return {
      fallback: 'Fallback transaction data',
      author_name: element.recipientName,
      title: element.recipientPrimaryAccountNumber,
      text: element.invoices.forEach(element => {
        return `Invoice ID: ${element.uuid}\nInvoice Amount: ${element.amount}\nInvoice Date: <!date^${element.invoiceDate}^{date_short_pretty}|Unix Time: ${element.invoiceDate}>\nDue Date: <!date^${element.dueDate}^{date_short_pretty}|Unix Time: ${element.dueDate}>`
      })
    }
  })
}

function colorizer (dueDate) {
  dueDate = parseInt(dueDate)
  const currentDate = Math.floor(Date.now() / 1000)
  const tenDays = 864000
  if (currentDate + tenDays > dueDate) {
    if (currentDate > dueDate) {
      // color red
      return '#b33a3a'
    }
    // color yellow
    return '#ff9900'
  } else {
    // color green
    return '#36a64f'
  }
}
