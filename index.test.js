import {
  createCron,
  getNextCron,
  isEvery,
  isToday,
  normalizeCron,
  parseCron,
  parseEvery,
  parseInput,
} from "./index";

// helper functions to create tests for all minutes in a day
const createMinutes = () => {
  let mins = [],
    minute = 0;
  while (mins.length < 60) {
    mins.push(minute);
    minute++;
  }
  return mins;
};
const createHours = () => {
  let hours = [],
    hour = 0;
  while (hours.length < 24) {
    hours.push(hour);
    hour++;
  }
  return hours;
};

const createInputTimes = () => {
  let result = [];
  for (const hour of createHours()) {
    for (const minute of createMinutes()) {
      result.push(`${hour}:${minute}`);
    }
  }
  return result;
};

// Automated tests
describe("Test against all minutes in a day", () => {
  const allDayMinutes = createInputTimes();
  it("should return correct daily cron job", () => {
    const everyDay = "30 1 /bin/run_me_daily";

    let results = [];
    allDayMinutes.forEach((currentTime) => {
      if (!results.includes(getNextCron(currentTime, everyDay)))
        results.push(getNextCron(currentTime, everyDay));
    });
    /* Removing last item from results
    because 1:30 appears two times for today & tomorrow */
    
    results.pop();
    expect(results).toHaveLength(1);
  });

  it("should return correct every minute cron job", () => {
    const everyMinute = "* * /bin/run_me_every_minute";

    let results = [];
    allDayMinutes.forEach((currentTime) => {
      if (!results.includes(getNextCron(currentTime, everyMinute)))
        results.push(getNextCron(currentTime, everyMinute));
    });
    expect(results).toHaveLength(allDayMinutes.length);
  });
});

// Custom tests
describe("Custom cases from specs", () => {
  it("should return correct daily cron job", () => {
    const currentTime = "16:10";
    const everyDay = "30 1 /bin/run_me_daily";

    expect(getNextCron(currentTime, everyDay)).toEqual("1:30 tomorrow /bin/run_me_daily");
  });

  it("should return correct every minute cron job", () => {
    const currentTime = "16:10";
    const everyMinute = "* * /bin/run_me_every_minute";

    expect(getNextCron(currentTime, everyMinute)).toEqual(
      "16:10 today /bin/run_me_every_minute"
    );
  });

  it("should return correct every hour cron job", () => {
    const currentTime = "16:10";
    const everyHour = "45 * /bin/run_me_hourly";

    expect(getNextCron(currentTime, everyHour)).toEqual("16:45 today /bin/run_me_hourly");
  });

  it("should return correct every minute in an hour cron job", () => {
    const currentTime = "16:10";
    const everyMinuteSingleHour = "* 19 /bin/run_me_sixty_times";

    expect(getNextCron(currentTime, everyMinuteSingleHour)).toEqual(
      "19:00 today /bin/run_me_sixty_times"
    );
  });
});

// Parser tests
describe("Parsers", () => {
  it("should parse dates&cron jobs correctly", () => {
    expect(isEvery("*")).toBe(true);
    expect(isEvery(132)).toBe(false);

    expect(parseEvery("*")).toBe("*");
    expect(parseEvery("123")).toBe(123);
    expect(parseCron("* 19 /bin/run_me_sixty_times")).toStrictEqual(["*", 19, NaN]);
    expect(parseInput("19:10")).toStrictEqual([10, 19]);
    expect(parseInput("19:10")).toStrictEqual([10, 19]);
    const cron = parseCron("* 19 /bin/run_me_sixty_");
    expect(normalizeCron(cron)).toEqual(["*", 19]);
    expect(createCron("25 19 /bin/run_me_sixty_times")).toEqual([25, 19]);
  });
});

// Utility tests
describe("Get Left Minutes", () => {
  it("should return the minutes left", () => {
    expect(isToday("16:10", "16:12")).toBe(true);
    expect(isToday("16:10", "16:10")).toBe(true);
    expect(isToday("16:10", "16:09")).toBe(false);
  });
});
