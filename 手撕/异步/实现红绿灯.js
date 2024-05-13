async function timer(color, delay) {
  return new Promise((res, rej) => {
    console.log(color);
    setTimeout(() => {
      res();
    }, delay);
  });
}
async function light() {
  await timer("green", 1000);
  await timer("yellow", 2000);
  await timer("red", 3000);
}
