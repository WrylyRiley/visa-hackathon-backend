const app = require('express')()
const mockData = require('./MOCK_DATA.json')

app.listen(4000, () => {
  console.log('app listening on port 4000')
})

app.get('/api/v1/healthz', (req, res) => {
  // just a stylistic choice
  res.status(200).json({ 'Message from the backend devs': '...yo...' })
})

app.get('/api/v1/invoices', (req, res) => {
  res.json(mockData)
})
