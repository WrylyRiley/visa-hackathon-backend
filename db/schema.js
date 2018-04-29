const mongoose = require('./connection')
const Schema = mongoose.Schema

const InvoiceSchema = new Schema({
  uuid: Number,
  invoiceDate: String,
  dueDate: String,
  amount: String,
  open: Boolean,
  vendor: { type: Schema.Types.ObjectId, ref: 'Vendor' }
})

const VendorSchema = new Schema({
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
  invoices: [{ type: Schema.Types.ObjectId, ref: 'Invoice' }]
})

const Invoice = mongoose.model('Invoice', InvoiceSchema)
const Vendor = mongoose.model('Vendor', VendorSchema)

module.exports = { Vendor, Invoice }
