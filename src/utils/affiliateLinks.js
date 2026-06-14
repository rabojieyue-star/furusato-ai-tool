const A8_SATOFULL = "4B3U75+7AKOAY+35Z2+6C9LE";
const A8_POCKEMARU = "4B3U75+7DJUBU+4PXI+BWVTE";

const buildKeyword = (region, product) => {
  const words = product.replace(/[【】「」\d]+/g, "").trim().split(/\s+/);
  const productKeyword = words.slice(0, 2).join(" ");
  return encodeURIComponent(`${region} ${productKeyword}`);
};

export const getSatofullUrl = (region, product) => {
  const keyword = buildKeyword(region, product);
  const targetUrl = `https://www.satofull.jp/products/search.php?keyword=${keyword}`;
  return `https://px.a8.net/svt/ejp?a8mat=${A8_SATOFULL}&a8ejpredirect=${encodeURIComponent(targetUrl)}`;
};

export const getPockemaruUrl = (region, product) => {
  const keyword = buildKeyword(region, product);
  const targetUrl = `https://pockemaru.com/furusato/?search=${keyword}`;
  return `https://px.a8.net/svt/ejp?a8mat=${A8_POCKEMARU}&a8ejpredirect=${encodeURIComponent(targetUrl)}`;
};
