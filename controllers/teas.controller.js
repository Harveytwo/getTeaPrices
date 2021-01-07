// 引入需要的工具包
const sp = require("superagent");
const cheerio = require("cheerio");

const getPriceNum = (text) => {
  return text.slice(1, -3);
};
const transformPriceNum = (num) => {
  if (num.includes("万")) {
    return parseFloat(num) * 10000;
  } else {
    return parseFloat(num);
  }
};

const getTeaInfoById = async (id) => {
  const BASE_URL = `https://www.donghetea.com/goods.php?id=${id}`;
  let info = {},
    nameText,
    unitText,
    priceText,
    priceTextNum;

  await (async () => {
    let html = await sp.get(BASE_URL);
    let $ = cheerio.load(html.text);
    nameText = $(".textInfo h1").text();
    unitText = $(".buyli ul .pro:nth-child(3) span").text();
    priceText = $(".shop_sb").text();
    priceTextNum = getPriceNum(priceText);

    const nameTextArray = nameText.split(" ");
    info.id = id;
    info.number =
      nameTextArray[0] && nameTextArray[0].replace("(升降价通知)", "");
    info.name =
      nameTextArray[1] && nameTextArray[1].replace("(升降价通知)", "");

    const unit = priceText.slice(-1);
    switch (unit) {
      case "件":
        {
          const jianUnitText = unitText
            .split(" ")
            .filter((i) => i.includes("提/件"));
          const tiUnitText = unitText
            .split(" ")
            .filter((i) => i.includes("片/提"));
          const jianUnitTextNum = parseFloat(jianUnitText);
          const tiUnitTextNum = parseFloat(tiUnitText);
          const price =
            transformPriceNum(priceTextNum) / (jianUnitTextNum * tiUnitTextNum);
          info.price = Math.round(price);
        }
        break;
      case "提":
        {
          const tiUnitText = unitText
            .split(" ")
            .filter((i) => i.includes("片/提"));
          const tiUnitTextNum = parseFloat(tiUnitText);
          const price = transformPriceNum(priceTextNum) / tiUnitTextNum;
          info.price = Math.round(price);
        }
        break;
      case "片":
        info.price = priceTextNum;
        break;
      case "罐":
        info.price = priceTextNum;
        break;
      default:
        info.price = "没有单位";
    }
  })();
  return info;
};
// list = [
//   {
//     id: '111',
//     name: 'name',
//     number: '111',
//     price: '11'
//   }
// ]

module.exports = {
  getTeaInfoById
};
