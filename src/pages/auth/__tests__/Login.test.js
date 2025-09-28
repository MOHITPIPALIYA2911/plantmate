import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../Login";

// Mock axios so tests don’t hit your backend
jest.mock("axios", () => ({ post: jest.fn() }));

// Mock notifications so we can assert on them
jest.mock("../../../utils/toastUtil", () => ({
  triggerNotification: jest.fn(),
}));
const { triggerNotification } = require("../../../utils/toastUtil");

test("renders login form", () => {
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );

  expect(screen.getByPlaceholderText(/mail@gmail.com/i)).toBeInTheDocument();
  expect(
    screen.getByPlaceholderText(/Enter your password/i)
  ).toBeInTheDocument();
});

test("submitting empty form shows validation error", () => {
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );

  fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
  expect(triggerNotification).toHaveBeenCalledWith(
    "error",
    "Please enter both email and password."
  );
});

test("toggles password visibility", () => {
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );

  const pwdInput = screen.getByPlaceholderText(/Enter your password/i);
  expect(pwdInput).toHaveAttribute("type", "password");

  const toggleBtn = screen.getByRole("button", { name: /show password/i });
  fireEvent.click(toggleBtn);
  expect(pwdInput).toHaveAttribute("type", "text");

  // now it should read "Hide password"
  const hideBtn = screen.getByRole("button", { name: /hide password/i });
  fireEvent.click(hideBtn);
  expect(pwdInput).toHaveAttribute("type", "password");
});
