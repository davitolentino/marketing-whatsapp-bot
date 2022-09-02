const sleep = async (delay = 0) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};

module.exports = { sleep };
