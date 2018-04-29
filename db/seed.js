const { Vendor, Invoice } = require('./schema')
const seedData = require('./seeds.json')
const invoiceSeedData = require('./invoiceseeds.json')

Invoice.remove({})
  .then(_ => {
    Vendor.remove({})
  .then(_ => {
    Invoice.collection.insert(invoiceSeedData)
    return Vendor.collection.insert(seedData)
  })
  .then(_ => {
    process.exit()
  })
})
