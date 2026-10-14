import React from "react";
import "./App.css";
import Main from "./containers/Main";
import AdminApp from "./admin/AdminApp";

function App() {
  if (window.location.pathname.replace(/\/+$/, "") === "/admin") {
    return <AdminApp />;
  }
  return (
    <div>
      <Main />
    </div>
  );
}

export default App;
