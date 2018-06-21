module.exports = (fn) => {
  const done = () => fn(done);

  return done();
};
