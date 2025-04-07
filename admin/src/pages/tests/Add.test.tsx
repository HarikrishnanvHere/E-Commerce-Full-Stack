jest.mock("../../App.tsx", () => ({
    backendUrl: "http://mocked-backend-url.com",
}))

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Add from "../Add";
import axios from "axios";
import React from "react";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => "mocked-url");
  });
  
describe("Add Component", () => {
  beforeEach(() => {
    mockedAxios.post.mockReset();
  });

  it("renders form elements correctly", () => {
    render(<Add token="test-token" />);

    expect(screen.getByPlaceholderText("Type Here")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Write Content Here")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("500")).toBeInTheDocument();
    expect(screen.getByText("Upload Image")).toBeInTheDocument();
    expect(screen.getByLabelText("Add to bestseller")).toBeInTheDocument();
  });

  it("allows user to fill text, select, checkbox, and file inputs", () => {
    render(<Add token="test-token" />);

    fireEvent.change(screen.getByPlaceholderText("Type Here"), { target: { value: "Test Product" } });
    fireEvent.change(screen.getByPlaceholderText("Write Content Here"), { target: { value: "Great product!" } });
    fireEvent.change(screen.getByPlaceholderText("500"), { target: { value: "999" } });

    fireEvent.click(screen.getByText("M")); // Select size
    fireEvent.click(screen.getByLabelText("Add to bestseller"));

    expect(screen.getByPlaceholderText("Type Here")).toHaveValue("Test Product");
    expect(screen.getByPlaceholderText("Write Content Here")).toHaveValue("Great product!");
    expect(screen.getByPlaceholderText("500")).toHaveValue(999);
    expect(screen.getByLabelText("Add to bestseller")).toBeChecked();
  });

  it("submits the form and calls axios with correct data", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

    render(<Add token="test-token" />);

    fireEvent.change(screen.getByPlaceholderText("Type Here"), { target: { value: "Test Product" } });
    fireEvent.change(screen.getByPlaceholderText("Write Content Here"), { target: { value: "Great product!" } });
    fireEvent.change(screen.getByPlaceholderText("500"), { target: { value: "999" } });

    const file = new File(["dummy"], "test.png", { type: "image/png" });
    const fileInput = screen.getByLabelText("", { selector: 'input[id="image1"]' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(screen.getByText("ADD"));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/product/add"),
        expect.any(FormData),
        expect.objectContaining({
          headers: { token: "test-token" },
        })
      );
    });
  });

  it("shows toast error on failed submission", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("Failed"));

    render(<Add token="test-token" />);

    fireEvent.change(screen.getByPlaceholderText("Type Here"), { target: { value: "Fail Test" } });
    fireEvent.change(screen.getByPlaceholderText("Write Content Here"), { target: { value: "Nope" } });
    fireEvent.change(screen.getByPlaceholderText("500"), { target: { value: "123" } });

    fireEvent.click(screen.getByText("ADD"));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });
});
