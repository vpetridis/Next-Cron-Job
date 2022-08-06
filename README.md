# Next Cron Job

This is a simple command line tool build in `node` that helps you find the next Cron Job. It parses the contents from a `txt` file and returns the job schedule.


## Example case
Your scheduler config could looks like this:
```
30 1 /bin/run_me_daily
45 * /bin/run_me_hourly
  * * /bin/run_me_every_minute
* 19 /bin/run_me_sixty_times
```

- The first field is the minutes past the hour
- The second field is the hour of the day
- The third is the command to run.

For both cases * means that it should run for all values of that field.

For instance, in the above example `run_me_daily` has been set to run at 1:30am every day and `run_me_hourly` at 45 minutes past the hour every hour. The fields are whitespace separated and each entry is on a separate line.

## Results

When fed this `config to stdin` and a simulated 'current time' in the format `HH:MM`, as a command line argument, it outputs the soonest time at which each of the commands will fire and whether it is today or tomorrow. For example, given the above examples as input and the simulated 'current time' command-line argument `16:10` the output will be:

```
1:30 tomorrow - /bin/run_me_daily
16:45 today - /bin/run_me_hourly
16:10 today - /bin/run_me_every_minute
19:00 today - /bin/run_me_sixty_times
```

## Usage

Please, be sure you have `NodeJs` (above 16) installed on your machine. The command template looks like this:
 ```
 node index.js <txt file> <time>
 ```

In other words, for a `cron-jobs.txt` file living in the same folder as this project, you have to run the following command:

`node index.js cron-jobs.txt 16:10`

