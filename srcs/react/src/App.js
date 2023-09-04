import React, { Fragment, useState, useCallback, useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

function App() {
  const { unityProvider, sendMessage, addEventListener, removeEventListener } = useUnityContext({
    loaderUrl: "build/1.loader.js",
    dataUrl: "build/1.data.unityweb",
    frameworkUrl: "build/1.framework.js.unityweb",
    codeUrl: "build/1.wasm.unityweb",
  });

  // react to unity
  function ButtonEvent()
  {
	sendMessage("Cube", "startGame");
  }

  // unity to react
  const [isOver, setIsOver] = useState();
  const handleGameOver = useCallback(() => {
    setIsOver(true);
  }, []);

  useEffect(() => {
    addEventListener("IsOver", handleGameOver);
    return () => {
      removeEventListener("IsOver", handleGameOver);
    };
  }, [addEventListener, removeEventListener, handleGameOver]);

  return (
	<Fragment>
	<div className="App">
		{isOver === true && (
			<p>{`Game Over!`}</p>
		)}
		<button onClick={ButtonEvent}> 시작 버튼 </button>
		<Unity unityProvider={unityProvider} style={{ width: 800, height: 600 }} />
	</div>
	</Fragment>
  );
}

export default App;
