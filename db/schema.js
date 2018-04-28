const mongoose =        require('./connection')

const InvoiceSchema =   new mongoose.Schema({
  uuid:                 Number,
  vendorID:             Number,
  vendorName:           String,
  dateOfPurchase:       Date,
  balanceDueDate:       Date,
  amountDue:            Number
})

const GameBoard =       mongoose.model('Invoice', InvoiceSchema)

module.exports =        Invoice
