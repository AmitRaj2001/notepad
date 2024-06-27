import React from "react";
import "./App.css"; // If you have any custom styles
import Notepad from "./components/Notepad"; // Import your Notepad component

function App() {
	return (
		<div className="App">
			<header className="App-header">
				<h3>Notepad Application</h3>
			</header>
			<main>
				<Notepad />
			</main>
		</div>
	);
}

export default App;

