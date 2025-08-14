import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Eraser, Download, Upload, RotateCcw } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface DrawingPath {
  points: Point[];
  tool: 'pen' | 'eraser';
  color: string;
  width: number;
}

const WireframeEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser'>('pen');
  const [brushSize, setBrushSize] = useState(2);
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set default styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPath: DrawingPath = {
      points: [{ x, y }],
      tool: currentTool,
      color: currentTool === 'pen' ? '#1E3A8A' : '#FFFFFF',
      width: currentTool === 'pen' ? brushSize : brushSize * 2
    };

    setCurrentPath(newPath);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentPath) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const updatedPath = {
      ...currentPath,
      points: [...currentPath.points, { x, y }]
    };

    setCurrentPath(updatedPath);
    drawPath(updatedPath);
  };

  const stopDrawing = () => {
    if (currentPath) {
      setDrawingPaths([...drawingPaths, currentPath]);
      setCurrentPath(null);
    }
    setIsDrawing(false);
  };

  const drawPath = (path: DrawingPath) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.width;

    ctx.beginPath();
    ctx.moveTo(path.points[0].x, path.points[0].y);

    for (let i = 1; i < path.points.length; i++) {
      ctx.lineTo(path.points[i].x, path.points[i].y);
    }

    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawingPaths([]);
    setCurrentPath(null);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'bcu-wireframe.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas and draw uploaded image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Reset paths
        setDrawingPaths([]);
        setCurrentPath(null);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bcu-page">
      <div className="bcu-page-header">
        <h1 className="bcu-page-title">Wireframe Editor</h1>
        <p className="bcu-page-subtitle">
          Create wireframes by drawing directly on the canvas or import existing designs to get started
        </p>
      </div>

      <div className="bcu-wireframe-container">
        <div className="bcu-toolbar bcu-card">
          <div className="bcu-tool-group">
            <button
              className={`bcu-tool-btn ${currentTool === 'pen' ? 'active' : ''}`}
              onClick={() => setCurrentTool('pen')}
            >
              <PenTool size={20} />
              Pen
            </button>
            <button
              className={`bcu-tool-btn ${currentTool === 'eraser' ? 'active' : ''}`}
              onClick={() => setCurrentTool('eraser')}
            >
              <Eraser size={20} />
              Eraser
            </button>
          </div>

          <div className="bcu-tool-group">
            <label className="bcu-label">Brush Size:</label>
            <input
              type="range"
              min="1"
              max="10"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="bcu-range"
            />
            <span className="bcu-brush-size">{brushSize}px</span>
          </div>

          <div className="bcu-tool-group">
            <button className="bcu-button bcu-button-outline" onClick={clearCanvas}>
              <RotateCcw size={20} />
              Clear
            </button>
            <button className="bcu-button bcu-button-outline" onClick={downloadCanvas}>
              <Download size={20} />
              Download
            </button>
            <label className="bcu-button bcu-button-outline">
              <Upload size={20} />
              Import
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        <div className="bcu-canvas-container bcu-card">
          <canvas
            ref={canvasRef}
            className="bcu-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{
              border: '2px dashed var(--bcu-gray-300)',
              borderRadius: 'var(--bcu-radius-lg)',
              cursor: currentTool === 'pen' ? 'crosshair' : 'default'
            }}
          />
        </div>

        <div className="bcu-instructions bcu-card">
          <h3>How to Use:</h3>
          <ul>
            <li><strong>Pen Tool:</strong> Draw your wireframe elements</li>
            <li><strong>Eraser Tool:</strong> Remove unwanted lines</li>
            <li><strong>Brush Size:</strong> Adjust line thickness</li>
            <li><strong>Import:</strong> Upload existing wireframes</li>
            <li><strong>Download:</strong> Save your wireframe as PNG</li>
          </ul>
          <p className="bcu-text-gray">
            <strong>Tip:</strong> Keep your wireframes simple and focused on layout structure. 
            The AI will use this as a guide to generate high-fidelity designs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WireframeEditor;
