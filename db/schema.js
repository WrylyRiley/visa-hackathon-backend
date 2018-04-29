const mongoose = require('./connection')

const InvoiceSchema = new mongoose.Schema({
  uuid: Number,
  invoiceDate: Date,
  dueDate: Date,
  amount: Number,
  open: Boolean
})

const VendorSchema = new mongoose.Schema({
  acquirerCountryCode: String,
  acquiringBin: String,
  businessApplicationId: String,
  cardAcceptor: {
    address: {
      country: String,
      county: String,
      state: String,
      zipCode: String
    },
    idCode: String,
    name: String,
    terminalId: String
  },
  cavv: String,
  foreignExchangeFeeTransaction: String,
  retrievalReferenceString: String,
  senderCardExpiryDate: String,
  senderCurrencyCode: String,
  senderPrimaryAccountString: String,
  surcharge: String,
  systemsTraceAuditString: String,
  nationalReimbursementFee: String,
  cpsAuthorizationCharacteristicsIndicator: String,
  addressVerificationData: {
    street: String,
    postalCode: String
  },
  invoices: [InvoiceSchema]
})

const Invoice = mongoose.model('Invoice', InvoiceSchema)
const Vendor = mongoose.model('Vendor', VendorSchema)

module.exports = { Vendor, Invoice }
