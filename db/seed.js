const { Vendor } = require('./schema')
const seedData = require('./seeds.json')

Vendor.remove({})
  .then(_ => {
    return Vendor.collection.insert(seedData)
  })
  .then(_ => {
    process.exit()
  })
