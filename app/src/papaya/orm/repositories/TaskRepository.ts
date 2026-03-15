import { Task } from "@/schema/resource-schemas";
import { Repository, ResourceIntrinsic } from "../Repository";

export class TaskRepository extends Repository<"Task"> {
  constructor() {
    super("Task");
  }

  factory = (data: Partial<Task>): ResourceIntrinsic<"Task"> => {
    return {
      memo: data.memo ?? "",
      completedAt: data.completedAt ?? null,
    };
  };
}

export const taskRepository = new TaskRepository();
