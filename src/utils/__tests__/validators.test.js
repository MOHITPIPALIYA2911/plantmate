import { isValidEmail } from "../validators";

test("valid emails", () => {
  expect(isValidEmail("a@b.com")).toBe(true);
});
test("invalid emails", () => {
  expect(isValidEmail("bad@com")).toBe(false);
});
