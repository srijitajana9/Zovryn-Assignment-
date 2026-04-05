const asyncHandler = require("../../utils/asyncHandler");
const {
  createRecord,
  getRecordById,
  updateRecord,
  deleteRecord,
  listRecords,
} = require("./record.service");

const createRecordHandler = asyncHandler(async (req, res) => {
  const record = await createRecord(req.body, req.user.id);

  res.status(201).json({
    success: true,
    data: record,
    message: "Financial record created successfully",
  });
});

const listRecordsHandler = asyncHandler(async (req, res) => {
  const result = await listRecords(req.query);

  res.status(200).json({
    success: true,
    data: result.records,
    pagination: result.pagination,
  });
});

const getRecordByIdHandler = asyncHandler(async (req, res) => {
  const record = await getRecordById(req.params.recordId);

  res.status(200).json({
    success: true,
    data: record,
  });
});

const updateRecordHandler = asyncHandler(async (req, res) => {
  const record = await updateRecord(req.params.recordId, req.body);

  res.status(200).json({
    success: true,
    data: record,
    message: "Financial record updated successfully",
  });
});

const deleteRecordHandler = asyncHandler(async (req, res) => {
  await deleteRecord(req.params.recordId);

  res.status(200).json({
    success: true,
    data: null,
    message: "Financial record deleted successfully",
  });
});

module.exports = {
  createRecordHandler,
  listRecordsHandler,
  getRecordByIdHandler,
  updateRecordHandler,
  deleteRecordHandler,
};
