import AngryBirdsGame from "../../components/birds/script";
import { useEffect, useState } from "react";
import { Timer } from "../../components/timer/timer";
import "./home.css";
import LOGO from "../../../assets/imgs/logo-lotr.jpeg";

export function Home() {
  const [shouldRenderBird, setShouldRenderBird] = useState(false);
  const [timerScore, setTimerScore] = useState(0);
  const [startTimer, setStartTimer] = useState(false);

  useEffect(() => {
    const handleSpaceKey = (e) => {
      if (e.code === "Space") {
        setShouldRenderBird(true);
        setStartTimer(false);
      }
    };

    document.addEventListener("keydown", handleSpaceKey);

    return () => {
      document.removeEventListener("keydown", handleSpaceKey);
    };
  }, []);

  const handleStartTimer = () => {
    setStartTimer(true);
  };

  return (
    <div className="home">
      <header>
        <div className="header-content">
          <img className="header-logo" src={LOGO} alt="logo"></img>
          <h1>SenhoR doS AnéiS - TimeR</h1>
        </div>
      </header>
      {!startTimer && !shouldRenderBird && (
        <div>Pressione espaço para jogaR</div>
      )}
      {shouldRenderBird && (
        <AngryBirdsGame
          shouldRender={shouldRenderBird}
          setShouldRender={setShouldRenderBird}
          setTimerScore={setTimerScore}
          setStartTimer={setStartTimer}
        />
      )}
      {timerScore !== 0 && !shouldRenderBird && (
        <>
          {!startTimer && (
            <>
              <button type="button" onClick={handleStartTimer}>
                Começar Timer de {timerScore} minutos
              </button>
            </>
          )}
          {startTimer && <Timer secondsGiven={timerScore * 60} />}
        </>
      )}
    </div>
  );
}
