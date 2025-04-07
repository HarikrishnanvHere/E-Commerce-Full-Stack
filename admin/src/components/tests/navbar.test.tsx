import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "../Navbar"
import "@testing-library/jest-dom";
import React from "react";

describe("Navbar Component", () => {
  it("renders navbar with logout button", () => {
    render(<Navbar setToken={jest.fn()} />);

    expect(screen.getByRole("button", { name: /Logout/i })).toBeInTheDocument();
  });

  it("logs out on button click", () => {
    const setTokenMock = jest.fn();
    render(<Navbar setToken={setTokenMock} />);

    fireEvent.click(screen.getByRole("button", { name: /Logout/i }));
    expect(setTokenMock).toHaveBeenCalledWith("");
  });
});
