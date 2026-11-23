const shuffle = <T>(items: readonly T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    result.splice(i, 1, ...result.splice(j, 1, ...result.slice(i, i + 1)));
  }
  return result;
};

export default shuffle;
