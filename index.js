const app = require('express')()
const bodyParser = require('body-parser')
var VisaAPIClient = require('./libs/visaapiclient.js')
const { Vendor, Invoice } = require('./db/schema')

app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

const baseUri = 'visadirect/'
const resourcePath = 'fundstransfer/v1/pushfundstransactions'
const visaAPIClient = new VisaAPIClient()

app.listen(4000, () => {
  console.log('app listening on port 4000')
})

app.get('/api/v1/healthz', (req, res) => {
  res.send('life ok mon')
})

app.post('/api/v1/reset', (req, res) => {
  Vendor.findOne({}).then(vendor => {
    vendor.invoices[0].open = true
    vendor.save(function (err) {})
  })
  res.send(200)
})

app.post('/api/v1/pay', (req, res) => {
  const args = req.body.text.split(' ')
  if (args.length != 1) {
    res.send('Hermes needs an invoice number to help ya mon')
  }
  const invoiceUUID = args[0]
  Vendor.findOne({})
    .then(vendor => {
      return constructVisaRequest(vendor, vendor.invoices[0])
    })
    .then(visaRequest => {
      visaAPIClient.doMutualAuthRequest(
        baseUri + resourcePath,
        visaRequest,
        'POST',
        {},
        function (err, responseCode) {
          if (!err) {
            Vendor.findOne({}).then(vendor => {
              vendor.invoices[0].open = false
              vendor.save(function (err) {})
              const paymentMessage = paymentStructure()
              res.json({ attachments: [paymentMessage] })
            })
          } else {
            res.send('Ooo Bad luck no payment was sent')
          }
        }
      )
    })
})

app.post('/api/v1/allInvoices', (req, res) => {
  Vendor.find({})
    .then(vendors => {
      console.log(vendors)
      if (vendors != undefined) {
        return vendors
      } else {
        Promise.reject(response.text()), error => Promise.reject(error)
      }
    })
    .then(vendors => {
      const cleanedVendors = invoicesStructure(vendors)
      res.json({ attachments: cleanedVendors })
    })
})

app.post('/api/v1/invoices', (req, res) => {
  const args = req.body.text.split(' ')
  if (args.length != 1) {
    res.send('Hermes needs an account number to help ya mon')
  }
  const vendorAccountNumber = args[0]
  Vendor.findOne({})
    .then(
      vendor =>
        vendor != undefined
          ? vendor
          : Promise.reject('Someting Went Wrong Mon'),
      error => Promise.reject(error)
    )
    .then(vendor => {
      const cleanedInvoices = invoicesStructure(vendor)
      res.json({ attachments: [cleanedInvoices] })
    })
    .catch(error => res.json({ error }))
})

app.post('/api/v1/invoice', (req, res) => {
  let invoiceQuery, vendorQuery, invoiceID
  // FIrst, searched for UUID in all invoices
  Invoice.findOne({ uuid: req.body.text })
    .then(query => {
      if (!query) {
        res.send('Invalid invoice number, mon!')
      }
      invoiceQuery = query
    })
    .then(_ => {
      // Next, searches for matching vendor record
      Vendor.findOne({ 'invoices._id': invoiceID })
        .then(query => {
          vendorQuery = query
        })
        .then(_ => {
          // Lastly, constructs a pretty card to send to slack
          let attachments = singleInvoice(invoiceQuery, vendorQuery)
          res.json({ attachments: [attachments] })
        })
        .catch(err => {
          console.log(err)
        })
    })
    .catch(err => {
      console.log(err)
    })
})

function invoicesStructure (vendor) {
  return {
    fallback: 'Invoice data',
    mrkdwn_in: ['title', 'author_name', 'text'],
    title: `${element.recipientName}\nType /pay {UUID} to initiate payment for a single invoice`,
    pretext: `Account Number: ${element.recipientPrimaryAccountNumber}`,
    text: element.invoices
      .map(element => {
        correctEmoji = emojifier(element.dueDate, element.open)
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
}

function singleInvoice (invoice, vendor) {
  let correctEmoji = emojifier(invoice.dueDate)
  console.log(vendor)
  return {
    fallback: 'Single invoice data',
    title: `${invoice.amount}`,
    author_name: `${vendor.recipientName}`,
    pretext: `Account Number: ${vendor.recipientPrimaryAccountNumber}`,
    fields: [
      {
        value: `Invoice Date: <!date^${invoice.invoiceDate}^{date_short_pretty}|Unix Time: ${invoice.invoiceDate}>`,
        short: true
      },
      {
        value: `Due Date: <!date^${invoice.dueDate}^{date_short_pretty}|Unix Time: ${invoice.dueDate}> ${correctEmoji}`,
        short: true
      }
    ],
    actions: [
      {
        name: 'interact',
        text: 'Approve',
        type: 'button',
        value: 'approve',
        style: 'primary'
      },
      {
        name: 'interact',
        text: 'Reject',
        type: 'button',
        value: 'reject',
        style: 'danger'
      }
    ]
  }
}

function paymentStructure () {
  return {
    fallback: 'Payment Complete',
    mrkdwn_in: ['title', 'author_name', 'text'],
    title: `Visa Payment has been completed for invoice 1231`
  }
}

function emojifier (dueDate, open) {
  dueDate = parseInt(dueDate)
  const currentDate = Math.floor(Date.now() / 1000)
  const tenDays = 864000
  console.log(open)
  if (currentDate + tenDays > dueDate && open) {
    if (currentDate > dueDate) {
      // red error
      return '\u26D4'
    }
    // yellow warning
    return '\u26A0'
  } else if (open) {
    // ballot check
    return '\u2611'
  } else {
    // green check
    return '\u2705'
  }
}

function constructVisaRequest (vendor, invoice) {
  return JSON.stringify({
    acquirerCountryCode: '840',
    acquiringBin: '408999',
    amount: '124.05',
    businessApplicationId: 'AA',
    cardAcceptor: {
      address: {
        country: 'USA',
        county: 'San Mateo',
        state: 'CA',
        zipCode: '94404'
      },
      idCode: 'CA-IDCode-77765',
      name: 'Visa Inc. USA-Foster City',
      terminalId: 'TID-9999'
    },
    localTransactionDateTime: '2018-04-28T15:06:40',
    merchantCategoryCode: '6012',
    pointOfServiceData: {
      motoECIIndicator: '0',
      panEntryMode: '90',
      posConditionCode: '00'
    },
    recipientName: 'rohan',
    recipientPrimaryAccountNumber: '4957030420210496',
    retrievalReferenceNumber: '412770451018',
    senderAccountNumber: '4653459515756154',
    senderAddress: '901 Metro Center Blvd',
    senderCity: 'Foster City',
    senderCountryCode: '124',
    senderName: 'Mohammed Qasim',
    senderReference: '',
    senderStateCode: 'CA',
    sourceOfFundsCode: '05',
    systemsTraceAuditNumber: '451018',
    transactionCurrencyCode: 'USD',
    transactionIdentifier: '381228649430015'
  })
}
