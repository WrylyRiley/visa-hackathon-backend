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
  Invoice.find({})
    .then(invoices => {
      // console.log('first passed invoice list', invoices)
      if (invoices != undefined) {
        // I wasn't getting implicit return to next promise
        return invoices
      } else {
        Promise.reject(response.text()), error => Promise.reject(error)
      }
      // invoices != undefined
      //   ? invoices
      //   : Promise.reject(response.text()), error => Promise.reject(error)
    })
    .then(invoices => {
      // console.log('second passed invoice list', invoices)
      const cleanedInvoices = invoicesStructure(invoices)
      console.log(cleanedInvoices)
      res.json({ attachments: cleanedInvoices })
    })
})

function invoicesStructure (invoices) {
  // console.log('third passed invoice list', invoices)
  return invoices.map(element => {
    element = element.toObject()
    return {
      fallback: 'Fallback transaction data',
      mrkdwn_in: ['title', 'author_name', 'text'],
      title: `${element.recipientName}*\nType /{UUID} to initiate payment for a single invoice`,
      pretext: `Account Number: ${element.recipientPrimaryAccountNumber}`,
      text: element.invoices
        .map(element => {
          correctEmoji = emojifier(element.dueDate)
          return `\n\n\nInvoice ID: ${element.uuid}\n*Invoice Amount: ${element.amount}*\nInvoice Date: <!date^${element.invoiceDate}^{date_short_pretty}|Unix Time: ${element.invoiceDate}>\nDue Date: <!date^${element.dueDate}^{date_short_pretty}|Unix Time: ${element.dueDate}> ${correctEmoji}`
        })
        .join(' '),
      actions: [
        {
          name: 'interact',
          text: 'Approve All',
          type: 'button',
          value: 'approve'
        },
        {
          name: 'interact',
          text: 'Reject All',
          type: 'button',
          value: 'reject'
        }
      ]
    }
  })
}

function emojifier (dueDate) {
  dueDate = parseInt(dueDate)
  const currentDate = Math.floor(Date.now() / 1000)
  const tenDays = 864000
  if (currentDate + tenDays > dueDate) {
    if (currentDate > dueDate) {
      // red error
      return '\u26D4'
    }
    // yellow warning
    return '\u26A0'
  } else {
    // green check
    return '\u2705'
  }
}
