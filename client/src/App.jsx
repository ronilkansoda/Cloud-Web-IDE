import { useEffect, useState, useCallback } from 'react'
import './App.css'
import Terminal from './components/terminal'
import FileTree from './components/tree'
import socket from './socket'
import AceEditor from "react-ace";

import { getFileMode } from "./utils/getFileMode";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";

function App() {
  const [fileTree, setFileTree] = useState({})
  const [selectedFile, setSelectedFile] = useState('')
  const [code, setCode] = useState("")
  const [selectedFileContent, setSelectedFileContent] = useState("");
  const [isSaved, setIsSaved] = useState(true);

  // const isSaved = selectedFileContent === code;

  useEffect(() => {
    if (code && !isSaved) {
      const timer = setTimeout(() => {
        socket.emit("file:change", {
          path: selectedFile,
          content: code,
        });
        setIsSaved(true);
      }, 5 * 1000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [code, selectedFile, isSaved]);

  useEffect(() => {
    setCode("");
  }, [selectedFile]);

  useEffect(() => {
    setCode(selectedFileContent);
  }, [selectedFileContent]);

  const getFileTree = async () => {
    const response = await fetch("http://localhost:8000/files")
    const result = await response.json();
    console.log('Fetched File Tree:', result.tree);
    setFileTree(result.tree)
  };

  useEffect(() => {
    getFileTree();
  }, []);

  useEffect(() => {
    socket.on("file:refresh", getFileTree);
    return () => {
      socket.off("file:refresh", getFileTree);
    }
  }, [getFileTree])

  const getFileContents = useCallback(async () => {
    if (!selectedFile) return;
    const response = await fetch(
      `http://localhost:8000/files/content?path=${selectedFile}`
    );
    const result = await response.json();
    setSelectedFileContent(result.content);
    console.log(result.content);
  }, [selectedFile]);

  useEffect(() => {
    if (selectedFile) getFileContents();
  }, [getFileContents, selectedFile]);

  return (
    <div className='playground-container'>
      <div className="editor-container">
        <div className="files">
          <FileTree onSelect={(path) => {
            setSelectedFileContent("");
            setSelectedFile(path);
          }}
            tree={fileTree} />
        </div>
        <div className="editor">
          {selectedFile && (
            <p>
              {selectedFile.replaceAll("/", ">")}
              <span style={{ marginLeft: '50px', color: isSaved ? 'green' : 'red', fontSize: '20px' }}>
                {isSaved ? "Saved" : "Unsaved"}
              </span>
            </p>
          )}

          <AceEditor
            width="100%"
            mode={getFileMode({ selectedFile })}
            value={code}
            onChange={(newCode) => {
              setCode(newCode);
              setIsSaved(false);
            }}
            name="ace-editor"
            editorProps={{ $blockScrolling: true }}
          />

        </div>
      </div>
      <div className='terminal-container'>
        <Terminal />
      </div>
    </div >
  )
}

export default App