const formatString = (template: string, params: Record<string, string | number | null>): string =>
  Object.entries(params).reduce(
    (result, [key, value]) => result.replace(new RegExp(`{${key}(:.*?)?\\??}`), String(value)),
    template,
  );

export default formatString;
