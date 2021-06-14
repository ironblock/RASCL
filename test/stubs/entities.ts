export const GetResponse = ["apples", "bananas", "coconuts"] as const;
export interface FruitQuantity {
  fruit: typeof GetResponse[number];
  quantity: number;
}
export const ExampleEntity: FruitQuantity = { fruit: "bananas", quantity: 99 };
