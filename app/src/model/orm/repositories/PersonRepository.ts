import { Person } from "@/model/schema/resource-schemas";
import { Repository, ResourceIntrinsic } from "../Repository";

export class PersonRepository extends Repository<"Person"> {
  constructor() {
    super("Person");
  }

  factory = (data: Partial<Person>): ResourceIntrinsic<"Person"> => {
    return {
      slug: data.slug!,
      nickname: data.nickname ?? "",
      icon: data.icon ?? undefined,
    };
  };
}

export const personRepository = new PersonRepository();
