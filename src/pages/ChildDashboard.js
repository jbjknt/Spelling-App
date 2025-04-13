import { useEffect, useState, useRef } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  arrayUnion,
} from "firebase/firestore";
import confetti from "canvas-confetti";

export default function ChildDashboard() {
  const [child, setChild] = useState(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showStar, setShowStar] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const starRef = useRef();

  // Load voices and default to UK English if available
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length > 0) {
        setVoices(allVoices);
        const ukVoice =
          allVoices.find((v) =>
            v.lang.toLowerCase().includes("en-gb")
          ) || allVoices[0];
        setSelectedVoice(ukVoice);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Load child info from Firebase
  useEffect(() => {
    const fetchChild = async () => {
      const snapshot = await getDocs(collection(db, "children"));
      const email = auth.currentUser?.email;
      const username = email?.split("@")[0];

      const match = snapshot.docs.find(
        (doc) => doc.data().name.toLowerCase() === username
      );

      if (match) {
        const unsub = onSnapshot(doc(db, "children", match.id), (docSnap) => {
          setChild({ id: match.id, ...docSnap.data() });
        });

        return () => unsub();
      } else {
        alert(
          "No matching child found. Make sure the child's name matches the part before the @ in their email."
        );
      }
    };

    fetchChild();
  }, []);

  const currentWord =
    child?.wordList?.words && child.wordList.words[currentWordIndex];

  const speakWord = () => {
    if (!currentWord || !selectedVoice) return;
    const utterance = new SpeechSynthesisUtterance(currentWord);
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang;
    window.speechSynthesis.speak(utterance);
  };

  const triggerStar = () => {
    setShowStar(true);
    setTimeout(() => setShowStar(false), 1000);
  };

  const checkAnswer = async () => {
    const isCorrect = input.trim().toLowerCase() === currentWord.toLowerCase();
    setResult(isCorrect ? "correct" : "wrong");

    if (isCorrect) triggerStar();

    const wordResult = {
      word: currentWord,
      correct: isCorrect,
      timestamp: new Date().toISOString(),
    };

    await updateDoc(doc(db, "children", child.id), {
      progress: arrayUnion(wordResult),
    });

    setTimeout(() => {
      setInput("");
      setResult(null);

      if (currentWordIndex + 1 >= child.wordList.words.length) {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        setShowComplete(true);
      } else {
        setCurrentWordIndex((prev) => prev + 1);
      }
    }, 1000);
  };

  const handleRestart = () => {
    setCurrentWordIndex(0);
    setInput("");
    setResult(null);
    setShowComplete(false);
  };

  if (!child || !child.wordList) {
    return (
      <div className="p-6 text-center text-xl text-gray-600">
        No word list assigned yet. Please check back later!
      </div>
    );
  }

  if (showComplete) {
    return (
      <div className="p-6 text-center text-2xl font-bold text-green-700">
        🎉 Great job! You finished the list!
        <br />
        <button
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleRestart}
        >
          🔁 Practice Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto text-center relative overflow-hidden">
      <h2 className="text-2xl font-bold mb-4 text-green-700">
        Practice: {child.wordList.name}
      </h2>

      {/* Voice selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Select Voice:</label>
        <select
          className="w-full p-2 border"
          value={selectedVoice?.name}
          onChange={(e) => {
            const chosen = voices.find((v) => v.name === e.target.value);
            setSelectedVoice(chosen);
          }}
        >
          {voices.map((voice, idx) => (
            <option key={idx} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={speakWord}
        className="mb-4 bg-purple-600 text-white px-4 py-2 rounded"
      >
        🔊 Hear Word
      </button>

      <input
        className="w-full p-2 border mb-2 text-center"
        placeholder="Type the word..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={checkAnswer}
      >
        Submit
      </button>

      {result === "correct" && (
        <p className="mt-2 text-green-600 font-semibold">✅ Correct!</p>
      )}
      {result === "wrong" && (
        <p className="mt-2 text-red-600 font-semibold">❌ Try again!</p>
      )}

      {/* Star Animation */}
      {showStar && (
        <div
          ref={starRef}
          className="absolute top-1/2 left-1/2 text-yellow-400 text-6xl animate-ping transform -translate-x-1/2 -translate-y-1/2"
        >
          ⭐
        </div>
      )}
    </div>
  );
}
