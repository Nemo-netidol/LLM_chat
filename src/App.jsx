import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import OpenAI from "openai";

const API_KEY = import.meta.env.VITE_API_KEY;

function App() {
  const [messages, setMessages] = useState([
    {
      content: "Start message",
      role: "user",
    },
    {
      content: "Response message",
      role: "assistant",
    },
  ]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (inputValue) {
      try {
        const newMessage = {
          content: inputValue,
          role: "user",
        };
        const newMessages = [...messages, newMessage];

        setMessages([...messages, newMessage]);
        console.log(newMessage);

        setInputValue("");

        const response = await fetch("/api/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, newMessage],
          }),
        });

        if (!response.ok) {
          throw new Error(response.status);
        }
        const data = await response.json();
        const res = data.choices[0].message.content;
        setDisplayMessage(res);
        console.log(res);
        setMessages([...newMessages, { content: res, role: "assistant" }]);
      } catch (error) {
        console.error("Fetch error", error);
      }
    }
  };

  const prompt = { content: "", role: "systems" };
  // setInputValue(prompt)
  // sendMessage()
  // setInputValue("")

  const [inputValue, setInputValue] = useState("");

  const [displayMessage, setDisplayMessage] = useState("");
  return (
    <>
      <div className="mockup-window border bg-base-300 w-full h-full flex flex-col pb-4">
        {/* Bubble mesage section */}
        <div className="h-full w-full overflow-scroll pb-8 p-5">
          {messages.map((msg, i) => {
            return (
              <div
                className={`chat ${
                  msg.role === "assistant" ? "chat-start" : "chat-end"
                }`}
                key={i}
              >
                <div
                  className={`chat-bubble bg-base-100 mb-4 flex items-start rounded-xl ${
                    msg.role === "assistant" ? "text-start" : "text-end"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}
        </div>
        <div className="">
          {/* Input box and summit button */}
          <form
            action="submit"
            className=" m-5 form-control flex justify-center"
            onSubmit={sendMessage}
          >
            <div className="flex w-[800px] max-w-full">
              <input
                className=" bg-white mb-3 text-blue-950 px-1 h-12 w-full "
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your question..."
              />
              <button
                className="btn text-primary-content bg-primary h-12 rounded-xs"
                type="submit"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default App;
