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
  const invoices = Invoice.find({})
    .then(
      invoices =>
        invoices != undefined ? invoices : Promise.reject(response.text()),
      error => Promise.reject(error)
    )
    .then(invoices => {
      res.json({ attachments: invoicesStructure(invoices) })
    })
})

function invoicesStructure (invoices) {
  return invoices.map(element => {
    return {
      color: colorizer(element),
      title: `Balance Due: ${element.toObject().balance_due}`,
      pretext: `*${element.toObject().vendor_name}*`,
      text: `Invoice Date: <!date^${element.toObject()
        .invoice_date}^{date_short_pretty}|Unix Time: ${element.toObject()
        .invoice_date}>\nDue Date: <!date^${element.toObject()
        .due_date}^{date_short_pretty}|Unix Time: ${element.toObject()
        .due_date}>`,
      mrkdwn_in: ['pretext'],
      actions: [
        {
          name: 'paymentBtn',
          text: 'Approve',
          style: 'primary',
          type: 'button',
          value: 'approve'
        },
        {
          name: 'paymentBtn',
          text: 'Reject',
          style: 'danger',
          type: 'button',
          value: 'reject'
        }
      ]
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
