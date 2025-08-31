export function integerToPrice(priceStr: string) {
  return parseInt(priceStr) / 100000000;
}

export function priceToInteger(priceStr: string) {
  return priceStr.replace(".", "");
}
