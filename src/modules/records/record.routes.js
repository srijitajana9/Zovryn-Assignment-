const express = require("express");

const { requireAuth, allowRoles } = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const {
  createRecordSchema,
  updateRecordSchema,
  recordIdParamSchema,
  listRecordsQuerySchema,
} = require("./record.validation");
const {
  createRecordHandler,
  listRecordsHandler,
  getRecordByIdHandler,
  updateRecordHandler,
  deleteRecordHandler,
} = require("./record.controller");

const router = express.Router();

router.use(requireAuth);

router.get("/", allowRoles(["viewer", "analyst", "admin"]), validate(listRecordsQuerySchema, "query"), listRecordsHandler);
router.get("/:recordId", allowRoles(["viewer", "analyst", "admin"]), validate(recordIdParamSchema, "params"), getRecordByIdHandler);
router.post("/", allowRoles(["admin"]), validate(createRecordSchema), createRecordHandler);
router.patch("/:recordId", allowRoles(["admin"]), validate(recordIdParamSchema, "params"), validate(updateRecordSchema), updateRecordHandler);
router.delete("/:recordId", allowRoles(["admin"]), validate(recordIdParamSchema, "params"), deleteRecordHandler);

module.exports = router;
