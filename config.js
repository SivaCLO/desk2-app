class Config {
  deskappServerURL = () => {
    return defaultStore.get("debug") ? `http://localhost:5050/v20` : `https://api.desk.clove.pro/20`;
  };
}

module.exports = Config;
