import React, { Fragment, useState, useCallback, useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

function App() {
  const { unityProvider, sendMessage, addEventListener, removeEventListener } = useUnityContext({
    loaderUrl: "build/1.loader.js",
    dataUrl: "build/1.data.unityweb",
    frameworkUrl: "build/1.framework.js.unityweb",
    codeUrl: "build/1.wasm.unityweb",
  });

  const [gameOver, setGameOver] = useState<boolean | undefined>(undefined);

  // react to unity
  function ButtonEvent() {
    sendMessage("GameManager", "StartGame");
  }

  // unity to react
  const handleGameOver = useCallback(() => {
    setGameOver(true);
  }, [setGameOver]);

  useEffect(() => {
    addEventListener("GameOver", handleGameOver);
    return () => {
      removeEventListener("GameOver", handleGameOver);
    };
  }, [addEventListener, removeEventListener, handleGameOver]);

  return (
    <Fragment>
      <div className="App">
        {gameOver === true && <p>{`Game Over!`}</p>}
        <button onClick={ButtonEvent}> 시작 버튼 </button>
        <Unity unityProvider={unityProvider} style={{ width: 1280, height: 720 }} />
      </div>
    </Fragment>
  );
}

export default App;
