const commas = (value: number): string => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const abbreviate = (value: number | null | undefined): string | number | null | undefined => {
  if (typeof value !== "number") {
    return value;
  }

  const tenThousand = 10000;
  const oneMillion = 1000000;
  const oneBillion = 1000000000;

  if (value === 0) {
    return "0";
  }

  if (value < tenThousand) {
    return commas(value);
  }

  let append = "B+";
  let trimCharacters = 9;

  if (value < oneMillion) {
    append = "K+";
    trimCharacters = 3;
  } else if (value < oneBillion) {
    append = "M+";
    trimCharacters = 6;
  }

  const valueString = value.toString();
  return valueString.substring(0, valueString.length - trimCharacters) + append;
};

export default abbreviate;
