import { useState, useEffect } from "react";
import timerSound from "./timer.mp3";
import gollum from "./pixelGollum.gif";
import ring from "./ring.jpeg"; 
import ground from './lotr-ground.png'
import "./timer.css";

export function Timer({ secondsGiven }) {
  const [timeRemaining, setTimeRemaining] = useState(secondsGiven);

  useEffect(() => {
    if (timeRemaining <= 0) {
      const alarm = new Audio(timerSound);
      alarm.play();
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;


  const percentCompleted = (secondsGiven - timeRemaining) / secondsGiven;
  
  const startPosition = 100; 
  const endPosition = 35; 
  const characterPosition = startPosition - (percentCompleted * (startPosition - endPosition));

  return (
    <>
      <div className="timer-holder">
        <img
          src={gollum}
          className="character"
          style={{ right: `calc(${characterPosition}% - 216px)` }}
          alt="character"
        />
        <div className="floating-container">
          <img src={ring} className="ring floating-image" alt="ring" />
          <div className="shadow"></div>
        </div>

        <div className="timer">
          {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
        <div className="ground-holder"><img className="ground" src={ground}></img></div>
      </div>
    </>
  );
}
