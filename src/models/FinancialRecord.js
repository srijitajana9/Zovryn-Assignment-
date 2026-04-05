const mongoose = require("mongoose");

const RECORD_TYPES = ["income", "expense"];

const financialRecordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    type: {
      type: String,
      enum: RECORD_TYPES,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    date: {
      type: Date,
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

financialRecordSchema.index({ date: -1 });
financialRecordSchema.index({ type: 1 });
financialRecordSchema.index({ category: 1 });
financialRecordSchema.index({ createdAt: -1 });
financialRecordSchema.index({ createdBy: 1 });

const FinancialRecord = mongoose.model("FinancialRecord", financialRecordSchema);

module.exports = {
  FinancialRecord,
  RECORD_TYPES,
};
