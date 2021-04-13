import ky from "ky";

import { GetResponse, FruitQuantity } from "./entities";

export const getExample = async () => await ky.get("example.com").json<typeof GetResponse>();
export const putExample = async (entity: FruitQuantity) =>
  await ky.put("example.com", { json: entity }).json<string>();
export const postExample = async (entity: FruitQuantity) =>
  await ky.post("example.com", { json: entity }).json<string>();
export const patchExample = async (entity: FruitQuantity) =>
  await ky.patch("example.com", { json: entity }).json<string>();
export const deleteExample = async (authentication: boolean, entity: FruitQuantity) =>
  await ky
    .delete("example.com", {
      json: entity,
      headers: { Authorization: authentication ? "TRUE" : "FALSE" },
    })
    .json<string>();
