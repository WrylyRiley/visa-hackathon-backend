const app = require('express')()
const { Vendor } = require('./db/schema')
const mockData = require('./MOCK_DATA.json')
const bp = require('body-parser')

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))

app.listen(4000, () => {
  console.log('app listening on port 4000')
})

app.get('/api/v1/healthz', (req, res) => {
  res.send('life ok mon')

})

app.post('/api/v1/invoices', (req, res) => {
  Vendor.find({})
    .then(vendors => {
      // console.log('first passed vendor list', vendors)
      if (vendors != undefined) {
        // I wasn't getting implicit return to next promise
        return vendors
      } else {
        Promise.reject(response.text()), error => Promise.reject(error)
      }
      // vendors != undefined
      //   ? vendors
      //   : Promise.reject(response.text()), error => Promise.reject(error)
    })
    .then(vendors => {
      // console.log('second passed invoice list', vendors)
      const cleanedVendors = vendorsStructure(vendors)
      console.log(cleanedVendors)
      res.json({ attachments: cleanedVendors })
    })
})

app.post('/api/v1/invoice', (req, res) => {
  let vendors = Vendor.findOne({
    'invoices.uuid': req.body.text
  }).then(query => {
    console.log(query.vendors)
  })
  res.send('vendor')
})

function vendorsStructure (vendors) {
  // console.log('third passed invoice list', vendors)
  return vendors.map(element => {
    element = element.toObject()
    return {
      fallback: 'Fallback transaction data',
      mrkdwn_in: ['title', 'author_name', 'text'],
      title: `${element.recipientName}*\nType /{UUID} to initiate payment for a single invoice`,
      pretext: `Account Number: ${element.recipientPrimaryAccountNumber}`,
      text: element.vendors
        .map(element => {
          correctEmoji = emojifier(element.dueDate)
          return `\n\n\nVendor ID: ${element.uuid}\n*Vendor Amount: ${element.amount}*\nVendor Date: <!date^${element.invoiceDate}^{date_short_pretty}|Unix Time: ${element.invoiceDate}>\nDue Date: <!date^${element.dueDate}^{date_short_pretty}|Unix Time: ${element.dueDate}> ${correctEmoji}`
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

function invoiceStructure (invoice, uuid) {
  // console.log(invoice, uuid)
  selectedVendor = invoice.vendors.filter(element => {
    element = element.toObject()
    return element.uuid == uuid
  })
  // console.log(selectedVendor)
  return {
    fallback: 'Individual UUID view',
    mrkdwn_in: ['title', 'author_name', 'text'],
    title: `Payment for ${element.recipientName} : `,
    pretext: `Account Number: ${element.recipientPrimaryAccountNumber}`,
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
