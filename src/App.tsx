import "./App.css";
import "@reach/dialog/styles.css";

import React, { Fragment } from "react";
import { Dashboard } from "./components/Dashboard";

export function App() {
  return (
    <Fragment>
      <header className="App-header">
        <h1>Covid-19</h1>
        <p>Vaccination centers</p>
      </header>
      <main className="App-main">
        <Dashboard />
      </main>
    </Fragment>
  );
}
