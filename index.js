import fs from "fs/promises";

const stdin = process.argv[3];
const location = process.argv[2];
let bins;

function setBins(bin = "") {
//   console.log("bin:", bin);
  const splitLines = (str) => str.split(/\r?\n/);
  bins = splitLines(bin);
}
async function catFromFile() {
  try {
    const data = await fs.readFile(location, { encoding: "utf8" });
    setBins(data);
  } catch (error) {
    console.error(error);
  }
}

await catFromFile();

// utility for functional programming
const compose =
  (...fns) =>
  (x) =>
    fns.reduceRight((res, fn) => fn(res), x);

// Parsers for corn job & user input

const isEvery = (str = "") => str.toString().includes("*");
const parseEvery = (str = "") => (isEvery(str) ? str : parseInt(str));
// remove folder location from array
const parseCron = (str = "") => str.split(" ").map(parseEvery);
const parseInput = (str = "") => str.split(":").reverse().map(parseEvery);
const normalizeCron = (cron) => cron.slice(undefined, -1);
const createCron = compose(normalizeCron, parseCron);

const getMinutes = ([hours, minutes]) => {
  let allMins = 0;
  if (hours > 1) {
    allMins = (hours - 1) * 60 + minutes;
    return allMins;
  }
  if (hours === 1) {
    allMins = minutes + 60;
    return allMins;
  }
  allMins = minutes;
  return allMins;
};

const isToday = (stdin, cron) => {
  //calculate minutes from current time to cron job
  const minutes =
    getMinutes(parseInput(cron).reverse()) - getMinutes(parseInput(stdin).reverse());
  // is remainder is negative this means cron job is  scheduled for tomorrow
  return minutes >= 0 ? true : false;
};
const getStdinTime = (stdin) => {
  const inputTime = parseInput(stdin);
  const hour = inputTime[1];
  const minute = inputTime[0];
  return [hour, minute];
};
const getCronTime = (cronConfig) => {
  const tempCron = createCron(cronConfig);
  const configHour = tempCron[1];
  const configMinute = tempCron[0];
  return [configHour, configMinute];
};

const getNextCron = (stdin, cronConfig) => {
  const [hour, minute] = getStdinTime(stdin);
  const [cronHour, cronMinute] = getCronTime(cronConfig);

  let nextHour, nextMinute;
  let result;

  // case for: '* *'
  if (isEvery(cronHour) && isEvery(cronMinute)) {
    const day = isToday(stdin, `${hour}:${minute}`);
    nextHour = hour;
    nextMinute = minute;
    // all other cases
    result = `${nextHour}:${nextMinute} ${day ? "today" : "tomorrow"} ${
      cronConfig.split(" ")[2]
    }`;
    return result;
  }
  // case for: '12, * '
  isEvery(cronHour) ? (nextHour = hour) : (nextHour = cronHour);

  if (isEvery(cronMinute)) {
    if (hour === cronHour) {
      nextMinute = minute;
    } else {
      nextMinute = "00";
    }
  } else {
    nextMinute = cronMinute;
  }
  const day = isToday(stdin, `${nextHour}:${nextMinute}`);
  // all other cases
  result = `${nextHour}:${nextMinute} ${day ? "today" : "tomorrow"} ${
    cronConfig.split(" ")[2]
  }`;
  return result;
};

// some examples
/* const fakeDataHourly = "45 * /bin/run_me_hourly";
const fakeDataDaily = "30 1 /bin/run_me_daily";
const fakeEveryMinuteSingleHour = "* 19 /bin/run_me_sixty_times";
const fakeEveryMinute = "* * /bin/run_me_every_minute"; */

bins.forEach((bin) => console.log(getNextCron(stdin, bin)));

// console.log(getNextCron(stdin, fakeDataHourly));

// console.log(getNextCron(stdin, fakeEveryMinuteSingleHour));
// console.log(getNextCron(stdin, fakeEveryMinute));

export {
  parseEvery,
  parseCron,
  parseInput,
  isEvery,
  normalizeCron,
  createCron,
  getNextCron,
  isToday,
  getMinutes,
};
