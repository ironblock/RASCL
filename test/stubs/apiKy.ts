import ky from "ky";

import { GetResponse, FruitQuantity } from "./entities";

export const getExample = async (): Promise<typeof GetResponse> =>
  await ky.get("example.com").json<typeof GetResponse>();
export const putExample = async (entity: FruitQuantity): Promise<string> =>
  await ky.put("example.com", { json: entity }).json<string>();
export const postExample = async (entity: FruitQuantity): Promise<string> =>
  await ky.post("example.com", { json: entity }).json<string>();
export const patchExample = async (entity: FruitQuantity): Promise<string> =>
  await ky.patch("example.com", { json: entity }).json<string>();
export const deleteExample = async (
  authentication: boolean,
  entity: FruitQuantity,
): Promise<string> =>
  await ky
    .delete("example.com", {
      json: entity,
      headers: { Authorization: authentication ? "TRUE" : "FALSE" },
    })
    .json<string>();
