const A8_SATOFULL = "4B3U75+7AKOAY+35Z2+6C9LE";
const A8_POCKEMARU = "4B3U75+7DJUBU+4PXI+BWVTE";

const buildKeyword = (region, product) => {
  const productKeyword = product.split(" ").slice(0, 3).join(" ");
  return encodeURIComponent(`${region} ${productKeyword}`);
};

export const getSatofullUrl = (region, product) => {
  const keyword = buildKeyword(region, product);
  const targetUrl = encodeURIComponent(
    `https://www.satofull.jp/search/?keyword=${keyword}`,
  );
  return `https://px.a8.net/svt/ejp?a8mat=${A8_SATOFULL}&a8ejpredirect=${targetUrl}`;
};

export const getPockemaruUrl = (region, product) => {
  const keyword = buildKeyword(region, product);
  const targetUrl = encodeURIComponent(
    `https://pockemaru.com/furusato/search?keyword=${keyword}`,
  );
  return `https://px.a8.net/svt/ejp?a8mat=${A8_POCKEMARU}&a8ejpredirect=${targetUrl}`;
};
