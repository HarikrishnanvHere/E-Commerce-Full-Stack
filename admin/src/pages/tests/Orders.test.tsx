jest.mock("../../App.tsx", () => ({
    backendUrl: "http://mocked-backend-url.com",
}))


import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Orders from "../Orders";
import axios from "axios";
import "@testing-library/jest-dom";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockOrders = [
    {
      _id: "2",
      UserId: "3",
      items: [
        { name: "item3", quantity: 1, size: "L" }, 
        { name: "item4", quantity: 4, size: "M" },
      ],
      paymentMethod: "Stripe",
      status: "Out for delivery",
      amount: 200,
      payment: true,
      date: 1742887160400,
      address: {
        firstName:"Harikrishnan",
        lastName:"V",
        email:"test@gmail.com",
        street:"Demo Street",
        city:"Indore",
        state:"MP",
        pincode:"123456",
        country:"India",
        phone:"1234567890"
      }
    },

    {
        _id: "1",
        UserId: "2",
        items: [
          { name: "item1", quantity: 6, size: "L" }, 
          { name: "item2", quantity: 2, size: "M" },
        ],
        paymentMethod: "Cash on delivery",
        status: "Packing",
        amount: 200,
        payment: false,
        date: 1742887160400,
        address: {
          firstName:"Harikrishnan",
          lastName:"V",
          email:"test@gmail.com",
          street:"Demo Street",
          city:"Indore",
          state:"MP",
          pincode:"123456",
          country:"India",
          phone:"1234567890"
        }
      },


  ];


  describe("Order Page Test Suite", ()=>{

    beforeEach(() => {
        mockedAxios.post.mockReset();
      });

    it("Should render the order list after fetching as soon as the page loads", async () => {
        //Mocking the axios post method after each test
        mockedAxios.post.mockResolvedValueOnce({
            data: { success: true, orders: mockOrders}
        })

        render(<Orders token = "mock-token" />)
        expect(screen.getByText("Orders Page")).toBeInTheDocument();

        await waitFor(()=>{
            expect(
                screen.getByText((content, element) => 
                  element?.textContent === "item1 X 6 L,"
                )
              ).toBeInTheDocument();
              expect(
                screen.getByText((content, element) => 
                  element?.textContent === "item2 X 2 M"
                )
              ).toBeInTheDocument();
              expect(
                screen.getByText((content, element) => 
                  element?.textContent === "item3 X 1 L,"
                )
              ).toBeInTheDocument();
              expect(
                screen.getByText((content, element) => 
                  element?.textContent === "item4 X 4 M"
                )
              ).toBeInTheDocument();
              expect(screen.getByText("Method : Cash on delivery")).toBeInTheDocument();
              expect(screen.getByText("Method : Stripe")).toBeInTheDocument();
              expect(screen.getByText("Payment: Pending")).toBeInTheDocument();
              expect(screen.getByText("Payment: Done")).toBeInTheDocument();
        })

    })
    it("Should display correct address information", async () => {
        mockedAxios.post.mockResolvedValueOnce({
          data: { success: true, orders: mockOrders },
        });
      
        render(<Orders token="mock-token" />);
      
        await waitFor(() => {
          expect(screen.getAllByText("Harikrishnan V").length).toBeGreaterThan(0);
          expect(screen.getAllByText("Demo Street,").length).toBeGreaterThan(0);
          expect(screen.getAllByText("Indore, MP, India, 123456").length).toBeGreaterThan(0);
          expect(screen.getAllByText("1234567890").length).toBeGreaterThan(0);
        });
      });
      
      it("Should trigger status update on dropdown change", async () => {
        mockedAxios.post
          .mockResolvedValueOnce({ data: { success: true, orders: mockOrders } }) // Initial fetch
          .mockResolvedValueOnce({ data: { success: true } }) // Status update
          .mockResolvedValueOnce({ data: { success: true, orders: mockOrders } }); // Refetch after update
      
        render(<Orders token="mock-token" />);
      
        await waitFor(() => {
          expect(screen.getByDisplayValue("Packing")).toBeInTheDocument(); // Order 1
        });
      
        const dropdowns = screen.getAllByRole("combobox");
        fireEvent.change(dropdowns[0], { target: { value: "Delivered" } });
      
        await waitFor(() => {
          expect(mockedAxios.post).toHaveBeenCalledWith(
            "http://mocked-backend-url.com/api/order/status",
            { orderId: "1", status: "Delivered" },
            { headers: { token: "mock-token" } }
          );
        });
      });
  })