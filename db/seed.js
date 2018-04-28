const { Invoice, Vendor } = require('./schema')
const seedData = require('./seeds.json')

Invoice.remove({})
  .then(_ => {
    return Invoice.collection.insert(seedData)
  })
  .then(_ => {
    process.exit()
  })
