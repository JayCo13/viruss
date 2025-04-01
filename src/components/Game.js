import React, { useState, useEffect, useRef } from 'react';
import '../styles/Game.css';

const Game = () => {
  const gameAreaRef = useRef(null);
  const birdRef = useRef(null);
  const audioRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [birdPosition, setBirdPosition] = useState(250);
  const [obstacles, setObstacles] = useState([]);
  const [playCount, setPlayCount] = useState(0);


  
  // Use public URL paths instead of imports
  const characterImg = `${process.env.PUBLIC_URL}/images/character.png`;
  const poleTopImg = `${process.env.PUBLIC_URL}/images/pole1.png`;
  const poleBottomImg = `${process.env.PUBLIC_URL}/images/pole2.png`;
  const poleTop2Img = `${process.env.PUBLIC_URL}/images/pole3.png`;
  const poleBottom2Img = `${process.env.PUBLIC_URL}/images/pole4.png`;
  const backgroundMusic = `${process.env.PUBLIC_URL}/audio/viruss.mp3`;
  
  // Adjust game physics for better gameplay
  const gravity = 0.4;
  const jump = -8; // Original value
  const mobileJump = -7; // Reduced jump strength for mobile
  const obstacleWidth = 120; // Further increased width for the toothbrush/pole
  const gapSize = 250; // Increased gap size to ensure bird can pass through
  const initialGameSpeed = 3.0;
  const [gameSpeed, setGameSpeed] = useState(initialGameSpeed);
  
  // Add minimum heights for poles to ensure visibility
  const minPoleHeight = 90; // Reduced minimum height to allow for larger gap
  const maxPoleHeight = 300; // Maximum height for poles
  
  // Minimum distance between obstacles to prevent overlap
  const minObstacleDistance = 400; // Increased minimum distance between obstacles
  
  // Character size adjustment
  const characterWidth = 110;  // Width for the bottle character
  const characterHeight = 110; // Height for the bottle character
  
  // Add debounce for click/tap handling
  const clickTimeoutRef = useRef(null);
  const isMobileRef = useRef(false);
  
  // Detect if user is on mobile
  useEffect(() => {
    isMobileRef.current = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);
  let birdVelocity = useRef(0);
  let animationFrameId = useRef(null);
  
  // Initialize game
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        handleJump();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameStarted, gameOver]);
  
  // Add letter-by-letter wave animation
  useEffect(() => {
    const waveTextElements = document.querySelectorAll('.wave-text');
    
    waveTextElements.forEach(element => {
      const text = element.textContent;
      element.textContent = '';
      
      for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span');
        span.textContent = text[i];
        span.style.setProperty('--i', i);
        element.appendChild(span);
      }
    });
  }, [gameStarted, gameOver]);
  
  // Game loop
  useEffect(() => {
    if (gameStarted && !gameOver) {
      const gameLoop = () => {
        updateBirdPosition();
        updateObstacles();
        checkCollision();
        animationFrameId.current = requestAnimationFrame(gameLoop);
      };
      
      animationFrameId.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameStarted, gameOver, birdPosition, obstacles]);
  
  // Update game speed based on score
  useEffect(() => {
    if (score >= 15) {
      setGameSpeed(6.0); // Increase speed significantly when score reaches 20
    } else if (score >= 13) {
      setGameSpeed(7);
    } else if (score >= 8) {
      setGameSpeed(5);
    }
    else {
      setGameSpeed(initialGameSpeed);
    }
  }, [score]);
    
  // Create a ref to track the score to avoid multiple updates
  const scoreRef = useRef(0);
  
  // Create a ref to track if audio has been initialized
  const audioInitializedRef = useRef(false);
  
  const startGame = () => {
    // Increment play count when starting a new game (not on first load)
    if (gameStarted) {
      const newPlayCount = playCount + 1;
      setPlayCount(newPlayCount);
      
    }
    
    setGameStarted(true);
    setGameOver(false);
    setBirdPosition(250);
    setScore(0);
    scoreRef.current = 0; // Reset score ref when starting a new game
    setObstacles([]);
    birdVelocity.current = 0;
    setGameSpeed(initialGameSpeed); // Reset game speed
    
    // Play background music when game starts - with improved mobile handling
    playAudio();
  };
  
  // Add a separate function to handle audio playback
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset audio to beginning
      
      // Only play if we haven't tried to initialize audio yet
      if (!audioInitializedRef.current) {
        audioInitializedRef.current = true;
        
        // Create a user gesture context for audio
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Audio playback started successfully
              console.log("Audio playback started successfully");
            })
            .catch(e => {
              // Auto-play was prevented, we'll try again on next user interaction
              console.log("Audio playback failed:", e);
              audioInitializedRef.current = false; // Reset so we can try again
            });
        }
      } else {
        // We've already initialized audio, just play it
        audioRef.current.play().catch(e => console.log("Audio playback failed:", e));
      }
    }
  };
  
  const handleCloseAd = () => {
    // Start the game after ad is closed
    setGameStarted(true);
    setGameOver(false);
    setBirdPosition(250);
    setScore(0);
    scoreRef.current = 0;
    setObstacles([]);
    birdVelocity.current = 0;
    setGameSpeed(initialGameSpeed);
    
    // Use the improved audio playback function
    playAudio();
  };
  
  const handleJump = (e) => {
    // Don't try to preventDefault for passive events
    // This avoids the "Unable to preventDefault inside passive event listener" warning
    
    // Prevent double clicks/taps with improved handling
    if (clickTimeoutRef.current) {
      return;
    }
    
    // Don't handle clicks when game is over (except for the replay button)
    if (gameOver) {
      return;
    }
    
    // Try to play audio on first interaction if it hasn't started yet
    if (!audioInitializedRef.current && audioRef.current) {
      playAudio();
    }
    
    // Set a timeout to prevent rapid clicks - increased to 300ms for mobile
    clickTimeoutRef.current = setTimeout(() => {
      clickTimeoutRef.current = null;
    }, isMobileRef.current ? 300 : 100);
    
    if (!gameStarted) {
      startGame();
    } else if (!gameOver) {
      // Use different jump strength for mobile
      birdVelocity.current = isMobileRef.current ? mobileJump : jump;
    }
  };
  
  const updateBirdPosition = () => {
    birdVelocity.current += gravity;
    setBirdPosition((prevPosition) => {
      const newPosition = prevPosition + birdVelocity.current;
      
      if (newPosition < 0) {
        return 0;
      }
      
      if (newPosition > gameAreaRef.current.clientHeight - birdRef.current.clientHeight) {
        setGameOver(true);
        return gameAreaRef.current.clientHeight - birdRef.current.clientHeight;
      }
      
      return newPosition;
    });
  };
  
  const updateObstacles = () => {
    // Generate new obstacles
    if (gameStarted && 
        (obstacles.length === 0 || 
         (obstacles.length > 0 && 
          obstacles[obstacles.length - 1].x < gameAreaRef.current.clientWidth - minObstacleDistance))) {
      
      const height = gameAreaRef.current.clientHeight;
      
      // Add extra space for the first obstacle
      const initialXPosition = obstacles.length === 0 
        ? gameAreaRef.current.clientWidth + 300 // Extra 300px for first obstacle
        : gameAreaRef.current.clientWidth;
      
      // Ensure poles have reasonable heights and gap is always passable
      const availableSpace = height - gapSize - (2 * minPoleHeight);
      const randomVariation = Math.floor(Math.random() * Math.min(availableSpace, maxPoleHeight - minPoleHeight));
      const topHeight = minPoleHeight + randomVariation;
      
      // Fix for bottom obstacle positioning and height
      const bottomHeight = height - topHeight - gapSize;
      
      // Ensure the bottom pole isn't too tall but still reaches the bottom
      const adjustedBottomHeight = Math.max(bottomHeight, height - (topHeight + gapSize));
      
      // Randomly select which pole image to use (alternating between the two sets)
      const poleSet = Math.random() > 0.5 ? 1 : 2;
      
      const newObstacle = {
        id: Date.now(),
        x: initialXPosition,
        topHeight: topHeight,
        bottomHeight: adjustedBottomHeight,
        passed: false,
        poleSet: poleSet // Add pole set information
      };
      
      setObstacles(prevObstacles => [...prevObstacles, newObstacle]);
    }
    
    // Move obstacles and remove off-screen ones
    setObstacles(prevObstacles => {
      const updatedObstacles = prevObstacles.map(obstacle => {
        const obstacleRight = obstacle.x + obstacleWidth;
        const birdLeft = birdRef.current.offsetLeft;
        
        // Check if bird has passed this obstacle
        if (!obstacle.passed && obstacleRight < birdLeft) {
          // Only update the score once per obstacle
          if (scoreRef.current === score) {
            setScore(score + 1);
            scoreRef.current = score + 1;
          }
          return { ...obstacle, passed: true };
        }
        
        return { ...obstacle, x: obstacle.x - gameSpeed };
      });
      
      return updatedObstacles.filter(obstacle => obstacle.x + obstacleWidth > 0);
    });
  };
  
  const checkCollision = () => {
    if (!birdRef.current || !gameAreaRef.current) return;
    
    const birdRect = birdRef.current.getBoundingClientRect();
    const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
    
    // Check if bird hits the ground or ceiling
    if (birdRect.bottom >= gameAreaRect.bottom || birdRect.top <= gameAreaRect.top) {
      setGameOver(true);
      return;
    }
    
    // Completely revised collision detection with obstacles
    for (const obstacle of obstacles) {
      // Calculate obstacle positions in screen coordinates
      const obstacleLeftPos = obstacle.x;
      const obstacleRightPos = obstacle.x + obstacleWidth;
      
      // Get bird positions
      const birdLeftPos = birdRef.current.offsetLeft;
      const birdRightPos = birdLeftPos + characterWidth;
      const birdTopPos = birdPosition;
      const birdBottomPos = birdPosition + characterHeight;
      
      // Create a smaller hitbox (25% smaller than visual size)
      const hitboxReduction = characterWidth * 0.25;
      const birdHitboxLeft = birdLeftPos + hitboxReduction;
      const birdHitboxRight = birdRightPos - hitboxReduction;
      const birdHitboxTop = birdTopPos + hitboxReduction;
      const birdHitboxBottom = birdBottomPos - hitboxReduction;
      
      // Check horizontal collision
      if (birdHitboxRight > obstacleLeftPos && birdHitboxLeft < obstacleRightPos) {
        // Check vertical collision with top pipe
        if (birdHitboxTop < obstacle.topHeight) {
          setGameOver(true);
          return;
        }
        
        // Check vertical collision with bottom pipe
        const bottomPipeTop = obstacle.topHeight + gapSize;
        if (birdHitboxBottom > bottomPipeTop) {
          setGameOver(true);
          return;
        }
      }
    }
  };
  
  return (
    <div className="game-wrapper">
      
      <div 
        className="game-container" 
        ref={gameAreaRef}
        onClick={handleJump}
        onTouchStart={(e) => {
          // Use this approach instead of preventDefault
          e.stopPropagation();
          handleJump();
        }}
        // Remove the onTouchEnd handler that was calling preventDefault
        style={{ touchAction: 'none' }} // Keep this to disable browser handling of touch gestures
      >
        {/* Floating virus background elements */}
        <div className="floating-virus">
          <div className="spike-x"></div>
          <div className="spike-y"></div>
        </div>
        <div className="floating-virus">
          <div className="spike-x"></div>
          <div className="spike-y"></div>
        </div>
        <div className="floating-virus">
          <div className="spike-x"></div>
          <div className="spike-y"></div>
        </div>
        <div className="floating-virus">
          <div className="spike-x"></div>
          <div className="spike-y"></div>
        </div>
        <div className="floating-virus">
          <div className="spike-x"></div>
          <div className="spike-y"></div>
        </div>
        <div className="floating-virus">
          <div className="spike-x"></div>
          <div className="spike-y"></div>
        </div>
        
        {/* Audio element */}
        <audio ref={audioRef} preload="auto">
          <source src={backgroundMusic} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
        
        {/* Rest of your game elements */}
        <div 
          className="bird" 
          ref={birdRef}
          style={{ 
            top: `${birdPosition}px`,
            backgroundImage: `url(${characterImg})`,
            width: `${characterWidth}px`,
            height: `${characterHeight}px`
          }}
        />
        
        {obstacles.map(obstacle => (
          <React.Fragment key={obstacle.id}>
            <div 
              className="obstacle top" 
              style={{ 
                left: `${obstacle.x}px`, 
                height: `${obstacle.topHeight}px`,
                width: `${obstacleWidth}px`,
                backgroundImage: `url(${obstacle.poleSet === 1 ? poleTopImg : poleTop2Img})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'repeat-y'
              }}
            >
              <div className="obstacle-wave"></div>
            </div>
            <div 
              className="obstacle bottom" 
              style={{ 
                left: `${obstacle.x}px`, 
                height: `${obstacle.bottomHeight}px`,
                width: `${obstacleWidth}px`,
                top: `${obstacle.topHeight + gapSize}px`,
                backgroundImage: `url(${obstacle.poleSet === 1 ? poleBottomImg : poleBottom2Img})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'repeat-y'
              }}
            >
              <div className="obstacle-wave"></div>
            </div>
          </React.Fragment>
        ))}
        
        {!gameStarted && (
          <div className="start-screen">
            <h1 className="wave-text">Flappy Di-rút</h1>
            <small className="text-start">Chạm để bắt đầu chơi</small>
          </div>
        )}
        
        {gameOver && (
          <div className="game-over text-color">
            <h1>Em phải tin anh chứ?</h1>
            <p>Anh chỉ yêu mỗi <i className="score-color">{score}</i> em thôi!</p>
            <button onClick={startGame}>Chơi lại</button>
          </div>
        )}
        
        {gameStarted && !gameOver && (
          <div className="score">{score}</div>
        )}
        
      </div>
      
    </div>
  );
};

export default Game;