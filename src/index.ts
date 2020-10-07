type ExecuteOptions<ItemType, ResultType> = {
  items: ItemType[];
  job: (item: ItemType) => Promise<ResultType> | ResultType;
  concurrentLimit?: number | undefined | null;
  minJobTime?: number | undefined | null;
};

const delay = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

function execute<ItemType, ResultType>(
  options: ExecuteOptions<ItemType, ResultType>
): Promise<ResultType[]> {
  const { items, job, concurrentLimit, minJobTime } = options;
  const remainingItems = items.slice();
  const results: ResultType[] = [];

  const attachJobStarter = (item: ItemType): Promise<void> => {
    return Promise.all([job(item), minJobTime ? delay(minJobTime) : undefined]).then(([result]) => {
      results.push(result);
      if (remainingItems.length) {
        return attachJobStarter(remainingItems.splice(0, 1)[0]);
      }
    });
  };

  const jobsBatch = remainingItems.splice(0, concurrentLimit || remainingItems.length);
  return Promise.all(jobsBatch.map(attachJobStarter)).then(() => {
    return results;
  });
}

export default execute;
export { delay, execute };
