const createTabConfiguration = (tabs, overrides) => {
  const configuration = { ...tabs };

  Object.keys(overrides).forEach(key => {
    configuration[key] = { ...tabs[key], ...overrides[key] };
  });

  return configuration;
};

export default createTabConfiguration;
