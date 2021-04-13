import ky from "ky";
import { GetResponse, FruitQuantity } from "./entities";

export const getExample = () => ky.get("example.com").json<typeof GetResponse>();
export const putExample = (entity: FruitQuantity) =>
  ky.put("example.com", { json: entity }).json<string>();
export const postExample = (entity: FruitQuantity) =>
  ky.post("example.com", { json: entity }).json<string>();
export const patchExample = (entity: FruitQuantity) =>
  ky.patch("example.com", { json: entity }).json<string>();
export const deleteExample = (authentication: boolean, entity: FruitQuantity) =>
  ky
    .delete("example.com", {
      json: entity,
      headers: { Authorization: authentication ? "TRUE" : "FALSE" },
    })
    .json<string>();
