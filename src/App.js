import './App.css';
import { io } from "socket.io-client";
import logo from "./assets/logo.png";

const socket = io(`http://localhost:7000`);

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <img src={logo} alt=""/>
        <div className="app-name b-500 primaryColor">
          Real Time Chat
        </div>
      </header>
    </div>
  );
}

export default App;
