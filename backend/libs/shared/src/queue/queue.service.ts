// 外部依赖
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Subject, bufferTime, filter, mergeMap } from "rxjs";

/**队列任务类型 */
type QueueTask = () => Promise<unknown>;

/**
 * 异步队列服务
 * 用于批量处理异步任务，避免阻塞主流程
 */
@Injectable()
export class QueueService implements OnModuleDestroy {
  /**任务流 */
  private readonly taskSubject = new Subject<QueueTask>();
  /**是否正在关闭 */
  private isShuttingDown = false;

  constructor() {
    // 批量处理任务，每100ms处理一批，最多100个任务
    this.taskSubject
      .pipe(
        bufferTime(100, undefined, 100),
        filter((tasks) => tasks.length > 0),
        mergeMap((tasks) => Promise.allSettled(tasks.map((task) => task()))),
      )
      .subscribe({
        next: (results) => {
          // 记录失败的任务
          results.forEach((result) => {
            if (result.status === "rejected") {
              console.error("队列任务执行失败:", result.reason);
            }
          });
        },
        error: (err) => {
          console.error("队列处理异常:", err);
        },
      });
  }

  /**
   * 添加任务到队列
   * @param task 异步任务
   */
  addTask(task: QueueTask): void {
    if (this.isShuttingDown) {
      console.warn("队列正在关闭，拒绝添加新任务");
      return;
    }
    this.taskSubject.next(task);
  }

  /**
   * 模块销毁时等待所有任务完成
   */
  async onModuleDestroy(): Promise<void> {
    this.isShuttingDown = true;
    // 等待3秒让剩余任务执行完成
    await new Promise((resolve) => setTimeout(resolve, 3000));
    this.taskSubject.complete();
  }
}
