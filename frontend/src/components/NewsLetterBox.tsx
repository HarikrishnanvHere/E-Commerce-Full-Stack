import React from "react";

const NewsLetterBox: React.FC = () => {

    interface FormEvent extends React.FormEvent<HTMLFormElement> {}

    function onSubmitHandler(event: FormEvent): void {
        event.preventDefault();
    }

  return (
    <div className="text-center">
      <p className="text-2xl font-medium text-gray-800">Get 20% OFF</p>
      <p className="text-gray-600 mt-3">Subscribe to the newsletter now and get 20% off on your first order.</p>
      <form onSubmit={onSubmitHandler} className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border-2 pl-3">
        <input className="w-full sm:flex-1 outline-none" type="email" placeholder="Enter your e-mail" required></input>
        <button type="submit" className="bg-black text-white text-xs py-4 px-10">SUBSCRIBE</button>
      </form>
    </div>
  );
};

export default NewsLetterBox;
