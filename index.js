// get from the stdin only the given time
const stdin = process.argv[2];

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
  const [configHour, configMinute] = getCronTime(cronConfig);

  let nextHour, nextMinute;
  let result;

  // case for: '* *'
  if (isEvery(configHour) && isEvery(configMinute)) {
    result = `${hour}:${minute} ${cronConfig.split(" ")[2]}`;
    return result;
  }
  // case for: '12, * '
  isEvery(configHour) ? (nextHour = hour) : (nextHour = configHour);

  if (isEvery(configMinute)) {
    if (hour === configHour) {
      nextMinute = minute;
    } else {
      nextMinute = "00";
    }
  } else {
    nextMinute = configMinute;
  }
  const day = isToday();
  // all other cases
  result = `${nextHour}:${nextMinute} ${cronConfig.split(" ")[2]}`;
  return result;
};

const fakeDataHourly = "45 * /bin/run_me_hourly";
const fakeDataDaily = "30 1 /bin/run_me_daily";
const fakeEveryMinuteSingleHour = "* 19 /bin/run_me_sixty_times";
const fakeEveryMinute = "* * /bin/run_me_every_minute";

getNextCron(stdin, fakeDataDaily);

getNextCron(stdin, fakeDataHourly);

getNextCron(stdin, fakeEveryMinuteSingleHour);
getNextCron(stdin, fakeEveryMinute);

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
