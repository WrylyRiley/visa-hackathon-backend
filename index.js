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
      color: colorizer(element.due_date),
      title: `Balance Due: ${element.balance_due}`,
      pretext: `*${element.vendor_name}*`,
      text: `Invoice Date: <!date^${element.invoice_date}^{date_short_pretty}|Unix Time: ${element.invoice_date}>\nDue Date: <!date^${element.due_date}^{date_short_pretty}|Unix Time: ${element.due_date}>`,
      mrkdwn_in: ['pretext']
    })
  })
  res.json({ attachments: attachments })
})

function colorizer (dueDate) {
  const currentDate = Math.floor(Date.now() / 1000)
  const tenDays = 864000
  // console.log(`current date + 10 days: ${currentDate + 864000}`)
  // console.log(`dueDate is: ${dueDate}`)
  let test = parseInt(dueDate)
  console.log(currentDate, test, tenDays)
  if (currentDate > test - tenDays) {
    console.log('orange')
    return '#ff9900'
  } else if (currentDate > test) {
    console.log('red')
    return '#b33a3a'
  } else {
    console.log('green')
    return '#36a64f'
  }
}
