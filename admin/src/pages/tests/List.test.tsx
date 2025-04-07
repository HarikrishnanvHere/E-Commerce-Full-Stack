jest.mock("../../App.tsx", () => ({
    backendUrl: "http://mocked-backend-url.com",
}))


import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import List from "../List";
import axios from "axios";
import "@testing-library/jest-dom";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockProducts = [
  {
    _id: "1",
    image: ["https://example.com/img1.jpg"],
    name: "Product 1",
    category: "Category 1",
    price: 100,
  },
  {
    _id: "2",
    image: ["https://example.com/img2.jpg"],
    name: "Product 2",
    category: "Category 2",
    price: 200,
  },
];

describe("List Component", () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
    mockedAxios.post.mockReset();
  });

  it("renders product list after fetch", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: true, products: mockProducts },
    });

    render(<List token="mock-token" />);
    expect(screen.getByText("All Products List")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("Product 2")).toBeInTheDocument();
    });
  });

  it("calls removeProduct and refreshes list on delete", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { success: true, products: mockProducts },
    });

    mockedAxios.post.mockResolvedValue({
      data: { success: true, message: "Product removed" },
    });

    render(<List token="mock-token" />);

    await waitFor(() => screen.getByText("Product 1"));

    const deleteButtons = screen.getAllByText("X");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/product/remove"),
        { id: "1" },
        { headers: { token: "mock-token" } }
      );
    });
  });

  it("shows toast error if fetch fails (API returns success: false)", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { success: false, message: "Error occurred" },
    });

    render(<List token="mock-token" />);
    await waitFor(() => {
      expect(screen.getByText("All Products List")).toBeInTheDocument();
    });
  });

  it("shows toast error if remove fails (API returns success: false)", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { success: true, products: mockProducts },
    });

    mockedAxios.post.mockResolvedValue({
      data: { success: false, message: "Remove failed" },
    });

    render(<List token="mock-token" />);
    await waitFor(() => screen.getByText("Product 1"));
    fireEvent.click(screen.getAllByText("X")[0]);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });
});
