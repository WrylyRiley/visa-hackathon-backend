const app = require('express')()

app.get('/api/v1/healthz', (req, res) => {
  res.send('life is a ok')
})
app.listen(4000, () => {
  console.log('app listening on port 4000')
})
