/**
 * 最大并发量控制 - 串行执行任务
 * @param {Array} tasks - 任务数组，每个任务都是返回Promise的函数
 * @param {number} timeout - 超时时间（毫秒）
 * @param {number} retries - 最大重试次数
 * @returns {Promise} 返回执行结果的Promise
 */
async function execute(tasks, timeout, retries) {
  const results = [];

  // 创建一个带超时的Promise包装器
  const withTimeout = (promise, timeoutMs) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`任务超时: ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);
  };

  // 执行单个任务的函数，包含重试逻辑
  const executeTask = async (task, maxRetries) => {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // 执行任务并添加超时控制
        const result = await withTimeout(task(), timeout);
        return result;
      } catch (error) {
        lastError = error;
        console.log(
          `任务执行失败 (尝试 ${attempt + 1}/${maxRetries + 1}):`,
          error.message
        );

        // 如果还有重试机会，继续重试
        if (attempt < maxRetries) {
          continue;
        }
      }
    }

    // 所有重试都失败了，抛出异常
    throw new Error(
      `任务执行失败，已重试${maxRetries}次: ${lastError.message}`
    );
  };

  // 串行执行所有任务
  for (let i = 0; i < tasks.length; i++) {
    try {
      const result = await executeTask(tasks[i], retries);
      results.push(result);
      console.log(`任务 ${i + 1} 执行成功:`, result);
    } catch (error) {
      console.error(`任务 ${i + 1} 最终执行失败:`, error.message);
      throw error; // 抛出异常，停止执行后续任务
    }
  }

  return results;
}

// 示例用法
async function example() {
  // 模拟任务函数
  const task1 = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.3) {
          resolve("Task 1 完成");
        } else {
          reject(new Error("Task 1 失败"));
        }
      }, 1000);
    });
  };

  const task2 = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve("Task 2 完成");
        } else {
          reject(new Error("Task 2 失败"));
        }
      }, 800);
    });
  };

  const task3 = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("Task 3 完成");
      }, 500);
    });
  };

  const tasks = [task1, task2, task3];

  try {
    console.log("开始执行任务...");
    const results = await execute(tasks, 2000, 2); // 超时2秒，最多重试2次
    console.log("所有任务执行完成:", results);
  } catch (error) {
    console.error("任务执行过程中出现错误:", error.message);
  }
}
