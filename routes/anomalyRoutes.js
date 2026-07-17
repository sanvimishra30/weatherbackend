const express           = require("express");
const router            = express.Router();
const { getAnomaly }    = require("../controllers/anomalyController");

console.log("getAnomaly:", getAnomaly);
console.log("typeof getAnomaly:", typeof getAnomaly);

router.get("/:city", getAnomaly);

module.exports = router;