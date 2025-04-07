jest.mock("../../App.tsx", () => ({
  backendUrl: "http://mocked-backend-url.com",
}));
render(<Login setToken={jest.fn()} />);

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../Login";
import { backendUrl } from "../../App";
import axios from "axios";
import React from "react";

jest.mock("axios");

describe("Login Component", () => {
  it("renders login form", () => {

    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
  });

  it("updates email and password fields on change", () => {
    render(<Login setToken={jest.fn()} />);

    const emailInput = screen.getByPlaceholderText("your@email.com");
    const passwordInput = screen.getByPlaceholderText("Enter your password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("submits form and sets token on success", async () => {
    const setTokenMock = jest.fn();
    (axios.post as jest.Mock).mockResolvedValueOnce({ data: { success: true, token: "mockToken" } });

    render(<Login setToken={setTokenMock} />);

    fireEvent.change(screen.getByPlaceholderText("your@email.com"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(`${backendUrl}/api/user/admin`, {
        email: "test@example.com",
        password: "password123",
      });
  
      expect(setTokenMock).toHaveBeenCalledWith("mockToken");
    })
    
  });
});
