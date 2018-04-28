const app = require('express')()
const Invoice = require('./db/schema')
const mockData = require('./MOCK_DATA.json')

app.listen(4000, () => {
  console.log('app listening on port 4000')
})

app.get('/api/v1/healthz', (req, res) => {
  res.send('life ok mon')
})

app.post('/api/v1/invoices', (req, res) => {
  res.json(mockData)
})

app.post('/api/v1/rabbit', (req, res) => {
  const invoices = Invoice.find({})
    .then(
      invoices =>
        invoices != undefined
          ? invoicesStructure(invoices)
          : Promise.reject(response.text()),
      error => Promise.reject(error)
    )
    .then(invoices => {
      console.log(invoices)
      res.json(invoices)
    })
    .catch(error => console.log(error))
})

function invoicesStructure (invoices) {
  let attachments = []
  invoices.forEach(element => {
    attachments.push({
      color: colorizer(element.due_date),
      title: `Balance Due: ${element.balance_due}`,
      pretext: `*${element.vendor_name}*`,
      text: `Invoice Date: <!date^${element.invoice_date}^{date_short_pretty}|Unix Time: ${element.invoice_date}>\nDue Date: <!date^${element.due_date}^{date_short_pretty}|Unix Time: ${element.due_date}>`,
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
    })
  })
  return {
    text: 'List of all invoices',
    attachments: attachments
  }
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
