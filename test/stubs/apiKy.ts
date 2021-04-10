import ky from "ky";
import { GetResponse, ExampleEntity } from "./response";

export const getExample = () => ky.get("example.com").json<typeof GetResponse>();
export const putExample = (entity: ExampleEntity) =>
  ky.put("example.com", { json: entity }).json<string>();
export const postExample = (entity: ExampleEntity) =>
  ky.post("example.com", { json: entity }).json<string>();
export const patchExample = (entity: ExampleEntity) =>
  ky.patch("example.com", { json: entity }).json<string>();
export const deleteExample = (entity: ExampleEntity) =>
  ky.delete("example.com", { json: entity }).json<string>();
