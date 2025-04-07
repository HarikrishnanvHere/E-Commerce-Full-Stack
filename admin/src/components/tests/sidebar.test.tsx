import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "../Sidebar";
import React from "react";

describe("Sidebar Component", () => {
  it("renders sidebar links", () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText(/Add Items/i)).toBeInTheDocument();
    expect(screen.getByText(/List Items/i)).toBeInTheDocument();
    expect(screen.getByText(/Orders/i)).toBeInTheDocument();
  });
});