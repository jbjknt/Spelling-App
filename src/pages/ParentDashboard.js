import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function ParentDashboard() {
  const [childName, setChildName] = useState("");
  const [wordListName, setWordListName] = useState("");
  const [words, setWords] = useState("");
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState("");

  useEffect(() => {
    const fetchChildren = async () => {
      const snapshot = await getDocs(collection(db, "children"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChildren(list);
    };

    fetchChildren();
  }, []);

  const handleAddChild = async () => {
    if (!childName) return;
    await addDoc(collection(db, "children"), { name: childName });
    setChildName("");
    const snapshot = await getDocs(collection(db, "children"));
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setChildren(list);
  };

  const handleAssignWordList = async () => {
    if (!wordListName || !words || !selectedChildId) return;

    const wordArray = words
      .split(",")
      .map((w) => w.trim())
      .filter(Boolean);

    const childRef = doc(db, "children", selectedChildId);

    await updateDoc(childRef, {
      wordList: {
        name: wordListName,
        words: wordArray,
      },
      progress: [],
    });

    setWordListName("");
    setWords("");
    setSelectedChildId("");
    alert("Word list assigned!");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Parent Dashboard</h2>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Add Child</h3>
        <input
          className="w-full p-2 border mb-2"
          placeholder="Child's name"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleAddChild}
        >
          Add Child
        </button>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Assign Word List</h3>
        <select
          className="w-full p-2 border mb-2"
          value={selectedChildId}
          onChange={(e) => setSelectedChildId(e.target.value)}
        >
          <option value="">Select a child</option>
          {children.map((child) => (
            <option key={child.id} value={child.id}>
              {child.name}
            </option>
          ))}
        </select>
        <input
          className="w-full p-2 border mb-2"
          placeholder="List name (e.g., Week 1)"
          value={wordListName}
          onChange={(e) => setWordListName(e.target.value)}
        />
        <textarea
          className="w-full p-2 border mb-2"
          rows={3}
          placeholder="Enter words separated by commas"
          value={words}
          onChange={(e) => setWords(e.target.value)}
        />
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={handleAssignWordList}
        >
          Assign List
        </button>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Child Progress</h3>
        {children.map((child) => (
          <div key={child.id} className="mb-6 p-4 border rounded">
            <h4 className="font-bold text-lg mb-2">{child.name}</h4>

            {child.wordList ? (
              <div className="mb-2">
                <p className="font-semibold">
                  Current List: {child.wordList.name}
                </p>
                <p className="text-sm text-gray-600">
                  Words: {child.wordList.words.join(", ")}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-2">No list assigned yet</p>
            )}

            {child.progress && child.progress.length > 0 ? (
              <div>
                <p className="font-semibold">Progress:</p>
                <ul className="list-disc list-inside text-sm">
                  {child.progress.map((entry, idx) => (
                    <li key={idx}>
                      {entry.word} —{" "}
                      <span
                        className={
                          entry.correct ? "text-green-600" : "text-red-600"
                        }
                      >
                        {entry.correct ? "✅ Correct" : "❌ Incorrect"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No progress recorded yet</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}