import React, { useState } from "react";
import LoginOverlay from "./components/auth/LoginOverlay";
import SignupOverlay from "./components/auth/SignupOverlay";
import Dashboard from "./components/dashboard/dashboard";

export default function App() {
  const [login, setLogin] = useState(true);
  const [signUp, setSignUP] = useState(false);

  return (
    <div>
      {login ? null : signUp ? (
        <>
          <SignupOverlay setLogin={setLogin} setSignUP={setSignUP} />
        </>
      ) : (
        <>
          <LoginOverlay setLogin={setLogin} setSignUP={setSignUP} />
        </>
      )}
      <Dashboard setLogin={setLogin} />
    </div>
  );
}
