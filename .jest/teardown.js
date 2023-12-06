module.exports = async function() {
  await global.postgresContainer.stop();
};
