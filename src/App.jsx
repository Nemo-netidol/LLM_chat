import { use, useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import OpenAI from "openai";
import Login from "./components/Login";

function App() {
  const [messages, setMessages] = useState([]);

  const [isLoadingLLM, setLoadingLLM] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const Emote = {
    idle: "https://media1.tenor.com/m/09mZ-hWCCY4AAAAC/the-quintessential-quintuplets-gotubun-no-hanayome.gif",
    happy: "https://media1.tenor.com/m/wbVB2qsdMsYAAAAC/aa.gif",
    sad: "https://media1.tenor.com/m/6P2n7kzBJPkAAAAd/nino-gotoubun.gif",
    angry:
      "https://media1.tenor.com/m/4KvQZx-Z59gAAAAd/nino-nakano-nakano-nino.gif",
    blush:
      "https://media1.tenor.com/m/I1fp-bEt9VgAAAAC/nino-nakano-the-quintessential-quintuplets.gif",
  };

  const [emotion, setEmotion] = useState("idle");

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue) return;

    const newMessage = {
      role: "user",
      content: inputValue,
    };


    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputValue("");

    try {
      // Then use previous messages + new message to send to server
      // console.log([...messages, newMessage])
      const response = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // model: "bartowski/Qwen2.5-32B-Instruct-GGUF",
          messages: [...messages, newMessage], 
        }),
      });

      if (!response.ok) {
        const error = new Error(response.status);
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      const chatResponse = data.content;
      const emotion = data.emotion;
      const role = data.role

      setEmotion(emotion);

      // Append assistant's reply
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: role,
          content: chatResponse,
        },
      ]);
    } catch (error) {
      console.error("Fetch error", error);
      if (error.status === 500) {
        alert("Internal server error");
      }
    } finally {
      setInputValue(""); // clear input after send
    }
  };

  const bootLLM = async () => {
    
    try {
      
      console.log("bootLLM invoked")
      const bootResponse = await fetch("http://localhost:3001/start-4o-mini", {
        method: "POST"
        
      });
      console.log("bootLLM executed");
      
      // console.log("bootLLM(messages)", messages);

      if (!bootResponse.ok) {
        const error = new Error(bootResponse.status);
        error.status = bootResponse.status;
        throw error;
      } else {
        console.log("bootLLM: Sending system prompt successful!");

        const systemResponse = await bootResponse.json();

        // console.log(systemResponse)

        // console.log("emotion", systemResponse.emotion)
        // console.log("content", systemResponse.content)
        setMessages([{
          role: systemResponse.role,
          content: systemResponse.content
        }])

        setLoadingLLM(false);

      }
    } catch (error) {
      console.error("Error booting LLM:", error);
      // console.log(prompt_msg)
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      bootLLM();
    }
  }, [isLoggedIn]);

  const handleLogin = async(username, password) => {
    try {
      
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, password: password}),
      });

      if (!response.ok) {
        const err = await response.json()
        alert(err.message)

      } else {
        const data = await response.json()
        const isLogin = data.success
        console.log(isLogin)
        if (isLogin) {
          console.log("Login success!", data)
          setIsLoggedIn(true)
        } else {
          console.log("Login failed")
        }
      }
    } catch (error) {
      console.error(error);
    }
   
  }

  return (
    <>
    <div className="relative w-full h-screen">

      {!isLoggedIn && <Login handleLogin={handleLogin}/>}
      <div className={`${!isLoggedIn ? "blur-sm" : ""}`}></div>
      <div className="mockup-window border bg-base-300 w-full h-full flex flex-col pb-4">
        
        {/* GIF section */}
        <div className="flex justify-center ">
          <div className=" max-w-full w-64 h-64 rounded-md content-center">
            <img src={Emote[emotion]} />
          </div>
        </div>
        {isLoadingLLM ?( <div className="text-primary text-3xl">
          <p>Connecting to LLM...</p>
        </div>) : (<div></div>)}
        {/* Bubble mesage section */}
        <div className="h-full w-full overflow-scroll pb-8 p-5">
          {messages.filter((msg) => msg.role !== "system").map((msg, i) => {
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
                className={` ${
                  isLoadingLLM ? "text-black-100" : "text-blue-950"
                } bg-white mb-3  px-3 h-12 w-full rounded-l-sm`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`${
                  isLoadingLLM ? "Connecting to LLM" : "Type your message..."
                }`}
                disabled={isLoadingLLM}
              />
              <button
                className="btn btn-primary h-12 rounded-l-sm"
                type="submit"
                disabled={isLoadingLLM}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
      
    </>
  );
}

export default App;
