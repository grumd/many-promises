import execute from '../src/index';

const sampleItems = Array.from({ length: 10 }).map((x, i) => i);

test('concurrent limit not specified', async () => {
  const results = await execute({
    items: sampleItems,
    job: (n) => Promise.resolve(n),
  });
  expect(results).toEqual(sampleItems);
});

test('concurrent limit 3', async () => {
  const results = await execute({
    items: sampleItems,
    job: (n) => Promise.resolve(n),
    concurrentLimit: 3,
  });
  expect(results).toEqual(sampleItems);
});

test('with min job time', async () => {
  const results = await execute({
    items: sampleItems,
    job: (n) => Promise.resolve(n),
    concurrentLimit: 3,
    minJobTime: 1,
  });
  expect(results).toEqual(sampleItems);
});

test('syncronous job', async () => {
  const results = await execute({
    items: sampleItems,
    job: (n) => n,
    concurrentLimit: 3,
  });
  expect(results).toEqual(sampleItems);
});
test('syncronous job with min job time', async () => {
  const results = await execute({
    items: sampleItems,
    job: (n) => n,
    concurrentLimit: 3,
    minJobTime: 1,
  });
  expect(results).toEqual(sampleItems);
});

test('concurrent limit higher than items length', async () => {
  const results = await execute({
    items: sampleItems,
    job: (n) => Promise.resolve(n),
    concurrentLimit: sampleItems.length * 2,
  });
  expect(results).toEqual(sampleItems);
});

test('concurrent limit higher than items length, synchronous job', async () => {
  const results = await execute({
    items: sampleItems,
    job: (n) => n,
    concurrentLimit: sampleItems.length * 2,
  });
  expect(results).toEqual(sampleItems);
});

test('must respect concurrentLimit setting', async () => {
  let runningJobs = 0,
    runningJobsMax = 0;
  const concurrentLimit = 3;
  await execute({
    items: sampleItems,
    job: () => {
      runningJobs++;
      runningJobsMax = Math.max(runningJobsMax, runningJobs);

      return new Promise((resolve) => {
        setTimeout(() => {
          runningJobs--;
          resolve();
        }, 0);
      });
    },
    concurrentLimit,
  });
  expect(runningJobsMax).toEqual(concurrentLimit);
});

test('must respect minJobTime setting', async () => {
  let lastJobStart = 0,
    minTime: number | null = null,
    maxTime: number | null = null;
  const minJobTime = 50;
  await execute({
    items: sampleItems,
    job: () => {
      if (lastJobStart) {
        const timeBetweenJobs = performance.now() - lastJobStart;
        minTime = minTime ? Math.min(minTime, timeBetweenJobs) : timeBetweenJobs;
        maxTime = maxTime ? Math.max(maxTime, timeBetweenJobs) : timeBetweenJobs;
      }
      lastJobStart = performance.now();
      return Promise.resolve();
    },
    minJobTime,
    concurrentLimit: 1,
  });
  // Minimum job time can be 1ms smaller because of timing stuff
  expect(minTime).toBeGreaterThanOrEqual(minJobTime - 1);
});
