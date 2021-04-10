export const GetResponse = ["apples", "bananas", "coconuts"] as const;
export type ExampleEntity = {
  fruit: typeof GetResponse[number];
  quantity: number;
};
