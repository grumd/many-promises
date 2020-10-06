# many-promises
[![npm version](https://badge.fury.io/js/many-promises.svg)](https://badge.fury.io/js/many-promises) ![](https://travis-ci.org/grumd/many-promises.svg?branch=main) 

**many-promises** allows sequential or parallel promise evaluation, including limiting number of promises that can be in progress at the same time. Includes Typescript typings, but can be used in Javascript projects as well.

## Installation

```
npm install many-promises
```

## Example

```js
import execute from 'many-promises';

const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const job = (item) => Promise.resolve(item * 2);

const results = await execute({ items, job, concurrentLimit: 3, minJobTime: 100 });
// Will call `job` for every `item` in `items` and await until all promises are resolved.
// concurrentLimit - Maximum of 3 promises can be in progress at a time.
// minJobTime - If a job finishes faster than 100ms, next job will only start when 100ms pass since previous job started.
// results - [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
```

## Reference

#### `execute(options: ExecuteOptions)`

```ts
type ExecuteOptions<ItemType, ResultType> = {
  items: ItemType[];
  job: (item: ItemType) => Promise<ResultType> | ResultType;
  concurrentLimit?: number | undefined | null;
  minJobTime?: number | undefined | null;
};
```

*Note:* Types ItemType and ResultType are usually inferred and you don't need to specify them explicitly.

##### `items`
Array of items of any type.

##### `job`
A function with one argument - which is an item from the `items` array.

##### `concurrentLimit` (optional)
Maximum number of Promises that can be in progress at the same time.
Default - `undefined`

##### `minJobTime` (optional)
Minimum time of execution for one job. If a job finishes earlier, next job will wait for this timeout to end before starting.
Default - `undefined`
