const app = require('express')()
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
  let attachments = []
  mockData.forEach(element => {
    attachments.push({
      title: `Balance Due: ${element.balance_due}`,
      pretext: `*${element.vendor_name}*`,
      text: `Invoice Date: ${element.invoice_date}\nDue Date: ${element.due_date}`,
      mrkdwn_in: ['pretext']
    })
  })
  res.json({ attachments: attachments })
})
