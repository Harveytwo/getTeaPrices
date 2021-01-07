const express = require("express");

const teasController = require("../controllers/teas.controller");

const router = express.Router();
const getTeaInfo = async (ids) => {
  const infoList = [];
  for (let id of ids) {
    try {
      const info = id && (await teasController.getTeaInfoById(id));
      infoList.push(info);
    } catch (e) {
      console.log(e);
      infoList.push(e);
    }
  }
  return infoList;
};
router.get("", async (req, res, next) => {
  const ids = (req.query.id || "").split(",");
  const infoList = await getTeaInfo(ids);
  res.render("pages/priceList", {
    infoList
  });
});

module.exports = router;
