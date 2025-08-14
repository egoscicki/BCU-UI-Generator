import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Square, 
  Circle, 
  Type, 
  Move, 
  Pen, 
  Eraser, 
  Download, 
  Upload, 
  Trash2
} from 'lucide-react';

interface WireframeElement {
  id: string;
  type: 'drawing' | 'rectangle' | 'circle' | 'text' | 'line';
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
  text?: string;
  fontSize?: number;
  color: string;
  selected: boolean;
}

interface WireframeData {
  elements: WireframeElement[];
  canvasWidth: number;
  canvasHeight: number;
  background: string;
}

const WireframeEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTool, setCurrentTool] = useState<'select' | 'pen' | 'eraser' | 'rectangle' | 'circle' | 'text' | 'line'>('select');
  const [elements, setElements] = useState<WireframeElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [brushSize, setBrushSize] = useState(2);
  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [elementColor, setElementColor] = useState('#1E3A8A');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    
    const gridSize = 20;
    for (let x = 0; x <= canvasSize.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasSize.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvasSize.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasSize.width, y);
      ctx.stroke();
    }
  }, [canvasSize.width, canvasSize.height]);

  const drawElement = useCallback((ctx: CanvasRenderingContext2D, element: WireframeElement) => {
    ctx.strokeStyle = element.color;
    ctx.fillStyle = element.color;
    ctx.lineWidth = element.selected ? 3 : 2;

    if (element.selected) {
      ctx.setLineDash([5, 5]);
    } else {
      ctx.setLineDash([]);
    }

    switch (element.type) {
      case 'drawing':
        if (element.points && element.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          element.points.forEach(point => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
        break;

      case 'rectangle':
        if (element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          if (element.selected) {
            ctx.fillStyle = 'rgba(30, 58, 138, 0.1)';
            ctx.fillRect(element.x, element.y, element.width, element.height);
            
            // Draw resize handles
            drawResizeHandles(ctx, element);
          }
        }
        break;

      case 'circle':
        if (element.width && element.height) {
          ctx.beginPath();
          ctx.ellipse(
            element.x + element.width / 2,
            element.y + element.height / 2,
            element.width / 2,
            element.height / 2,
            0, 0, 2 * Math.PI
          );
          ctx.stroke();
          if (element.selected) {
            ctx.fillStyle = 'rgba(30, 58, 138, 0.1)';
            ctx.fill();
            
            // Draw resize handles
            drawResizeHandles(ctx, element);
          }
        }
        break;

      case 'text':
        if (element.text) {
          ctx.font = `${element.fontSize || 16}px Arial`;
          ctx.fillStyle = element.color;
          ctx.fillText(element.text, element.x, element.y);
          if (element.selected) {
            ctx.strokeStyle = '#1E3A8A';
            ctx.lineWidth = 1;
            const metrics = ctx.measureText(element.text);
            ctx.strokeRect(
              element.x - 2,
              element.y - (element.fontSize || 16),
              metrics.width + 4,
              (element.fontSize || 16) + 4
            );
          }
        }
        break;

      case 'line':
        if (element.points && element.points.length === 2) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          ctx.lineTo(element.points[1].x, element.points[1].y);
          ctx.stroke();
        }
        break;
    }
  }, []);

  const drawResizeHandles = (ctx: CanvasRenderingContext2D, element: WireframeElement) => {
    if (!element.width || !element.height) return;
    
    const handleSize = 8;
    ctx.fillStyle = '#1E3A8A';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    
    // Draw corner handles
    const right = element.x + element.width;
    const bottom = element.y + element.height;
    
    // Southeast handle
    ctx.fillRect(right - handleSize/2, bottom - handleSize/2, handleSize, handleSize);
    ctx.strokeRect(right - handleSize/2, bottom - handleSize/2, handleSize, handleSize);
    
    // Southwest handle
    ctx.fillRect(element.x - handleSize/2, bottom - handleSize/2, handleSize, handleSize);
    ctx.strokeRect(element.x - handleSize/2, bottom - handleSize/2, handleSize, handleSize);
    
    // Northeast handle
    ctx.fillRect(right - handleSize/2, element.y - handleSize/2, handleSize, handleSize);
    ctx.strokeRect(right - handleSize/2, element.y - handleSize/2, handleSize, handleSize);
    
    // Northwest handle
    ctx.fillRect(element.x - handleSize/2, element.y - handleSize/2, handleSize, handleSize);
    ctx.strokeRect(element.x - handleSize/2, element.y - handleSize/2, handleSize, handleSize);
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background grid
    drawGrid(ctx);

    // Draw all elements
    elements.forEach(element => {
      drawElement(ctx, element);
    });
  }, [elements, drawGrid, drawElement]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;
        drawCanvas();
      }
    }
  }, [canvasSize, drawCanvas]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    
    if (currentTool === 'select') {
      const clickedElement = findElementAtPosition(pos.x, pos.y);
      if (clickedElement) {
        setSelectedElement(clickedElement.id);
        setElements(prev => prev.map(el => ({
          ...el,
          selected: el.id === clickedElement.id
        })));
        
        // Check if clicking on resize handle
        const handle = getResizeHandle(pos.x, pos.y, clickedElement);
        if (handle) {
          setIsResizing(true);
          setResizeHandle(handle);
          setDragOffset({ x: pos.x - clickedElement.x, y: pos.y - clickedElement.y });
        } else {
          // Start dragging
          setIsDragging(true);
          setDragOffset({ 
            x: pos.x - clickedElement.x, 
            y: pos.y - clickedElement.y 
          });
        }
      } else {
        setSelectedElement(null);
        setElements(prev => prev.map(el => ({ ...el, selected: false })));
      }
      return;
    }

    if (currentTool === 'text') {
      setTextPosition(pos);
      setShowTextInput(true);
      return;
    }

    if (currentTool === 'pen') {
      setIsDrawing(true);
      setCurrentPath([pos]);
    }

    if (currentTool === 'line') {
      setCurrentPath([pos]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    
    if (isDrawing && currentTool === 'pen') {
      setCurrentPath(prev => [...prev, pos]);
    }
    
    if (isDragging && selectedElement) {
      const newX = pos.x - dragOffset.x;
      const newY = pos.y - dragOffset.y;
      
      setElements(prev => prev.map(el => 
        el.id === selectedElement 
          ? { ...el, x: newX, y: newY }
          : el
      ));
    }
    
    if (isResizing && selectedElement && resizeHandle) {
      const element = elements.find(el => el.id === selectedElement);
      if (element && element.width && element.height) {
        let newWidth = element.width;
        let newHeight = element.height;
        
        switch (resizeHandle) {
          case 'se':
            newWidth = pos.x - element.x;
            newHeight = pos.y - element.y;
            break;
          case 'sw':
            newWidth = element.x + element.width - pos.x;
            newHeight = pos.y - element.y;
            break;
          case 'ne':
            newWidth = pos.x - element.x;
            newHeight = element.y + element.height - pos.y;
            break;
          case 'nw':
            newWidth = element.x + element.width - pos.x;
            newHeight = element.y + element.height - pos.y;
            break;
        }
        
        if (newWidth > 20 && newHeight > 20) {
          setElements(prev => prev.map(el => 
            el.id === selectedElement 
              ? { ...el, width: newWidth, height: newHeight }
              : el
          ));
        }
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'pen' && isDrawing) {
      const newElement: WireframeElement = {
        id: Date.now().toString(),
        type: 'drawing',
        x: 0,
        y: 0,
        points: [...currentPath],
        color: elementColor,
        selected: false
      };
      setElements(prev => [...prev, newElement]);
      setIsDrawing(false);
      setCurrentPath([]);
    }

    if (currentTool === 'line' && currentPath.length === 1) {
      const pos = getMousePos(e);
      const newElement: WireframeElement = {
        id: Date.now().toString(),
        type: 'line',
        x: 0,
        y: 0,
        points: [...currentPath, pos],
        color: elementColor,
        selected: false
      };
      setElements(prev => [...prev, newElement]);
      setCurrentPath([]);
    }
    
    // Stop dragging and resizing
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  const addShape = (type: 'rectangle' | 'circle') => {
    const newElement: WireframeElement = {
      id: Date.now().toString(),
      type,
      x: 100,
      y: 100,
      width: type === 'rectangle' ? 120 : 80,
      height: type === 'rectangle' ? 80 : 80,
      color: elementColor,
      selected: false
    };
    setElements(prev => [...prev, newElement]);
  };

  const addText = () => {
    if (!textInput.trim()) return;

    const newElement: WireframeElement = {
      id: Date.now().toString(),
      type: 'text',
      x: textPosition.x,
      y: textPosition.y,
      text: textInput,
      fontSize,
      color: elementColor,
      selected: false
    };
    setElements(prev => [...prev, newElement]);
    setTextInput('');
    setShowTextInput(false);
  };

  const findElementAtPosition = (x: number, y: number): WireframeElement | null => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (isPointInElement(x, y, element)) {
        return element;
      }
    }
    return null;
  };

  const isPointInElement = (x: number, y: number, element: WireframeElement): boolean => {
    switch (element.type) {
      case 'rectangle':
        if (!element.width || !element.height) return false;
        return x >= element.x && x <= element.x + element.width &&
               y >= element.y && y <= element.y + element.height;
      
      case 'circle':
        if (!element.width || !element.height) return false;
        const centerX = element.x + element.width / 2;
        const centerY = element.y + element.height / 2;
        const radius = Math.min(element.width, element.height) / 2;
        return Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2) <= radius;
      
      case 'text':
        // Simple bounding box for text
        return x >= element.x - 5 && x <= element.x + 100 &&
               y >= element.y - 20 && y <= element.y + 5;
      
      default:
        return false;
    }
  };

  const getResizeHandle = (x: number, y: number, element: WireframeElement): string | null => {
    if (!element.width || !element.height) return null;
    
    const handleSize = 8;
    const right = element.x + element.width;
    const bottom = element.y + element.height;
    
    // Check corners
    if (x >= right - handleSize && y >= bottom - handleSize) return 'se';
    if (x <= element.x + handleSize && y >= bottom - handleSize) return 'sw';
    if (x >= right - handleSize && y <= element.y + handleSize) return 'ne';
    if (x <= element.x + handleSize && y <= element.y + handleSize) return 'nw';
    
    return null;
  };

  const deleteSelected = () => {
    if (selectedElement) {
      setElements(prev => prev.filter(el => el.id !== selectedElement));
      setSelectedElement(null);
    }
  };

  const clearCanvas = () => {
    setElements([]);
    setSelectedElement(null);
  };

  const exportWireframe = (): WireframeData => {
    return {
      elements,
      canvasWidth: canvasSize.width,
      canvasHeight: canvasSize.height,
      background: '#FFFFFF'
    };
  };

  const importWireframe = (data: WireframeData) => {
    setElements(data.elements);
    setCanvasSize({ width: data.canvasWidth, height: data.canvasHeight });
  };

  const downloadWireframe = () => {
    const data = exportWireframe();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wireframe.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          importWireframe(data);
        } catch (error) {
          console.error('Failed to import wireframe:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bcu-page">
      <div className="bcu-page-header">
        <h1 className="bcu-page-title">Wireframe Editor</h1>
        <p className="bcu-page-subtitle">
          Create professional wireframes with shapes, text, and drawing tools
        </p>
      </div>

      <div className="bcu-wireframe-container">
        <div className="bcu-wireframe-toolbar">
          <div className="bcu-tool-group">
            <button
              className={`bcu-tool-btn ${currentTool === 'select' ? 'active' : ''}`}
              onClick={() => setCurrentTool('select')}
              title="Select & Move"
            >
              <Move size={20} />
            </button>
            <button
              className={`bcu-tool-btn ${currentTool === 'pen' ? 'active' : ''}`}
              onClick={() => setCurrentTool('pen')}
              title="Freehand Drawing"
            >
              <Pen size={20} />
            </button>
            <button
              className={`bcu-tool-btn ${currentTool === 'eraser' ? 'active' : ''}`}
              onClick={() => setCurrentTool('eraser')}
              title="Eraser"
            >
              <Eraser size={20} />
            </button>
          </div>

          <div className="bcu-tool-group">
            <button
              className="bcu-tool-btn"
              onClick={() => addShape('rectangle')}
              title="Add Rectangle"
            >
              <Square size={20} />
            </button>
            <button
              className="bcu-tool-btn"
              onClick={() => addShape('circle')}
              title="Add Circle"
            >
              <Circle size={20} />
            </button>
            <button
              className={`bcu-tool-btn ${currentTool === 'line' ? 'active' : ''}`}
              onClick={() => setCurrentTool('line')}
              title="Draw Line"
            >
              <div style={{ width: 20, height: 2, backgroundColor: 'currentColor' }} />
            </button>
            <button
              className={`bcu-tool-btn ${currentTool === 'text' ? 'active' : ''}`}
              onClick={() => setCurrentTool('text')}
              title="Add Text"
            >
              <Type size={20} />
            </button>
          </div>

          <div className="bcu-tool-group">
            <input
              type="color"
              value={elementColor}
              onChange={(e) => setElementColor(e.target.value)}
              className="bcu-color-picker"
              title="Element Color"
            />
            <input
              type="range"
              min="1"
              max="10"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="bcu-brush-size"
              title="Brush Size"
            />
            <input
              type="number"
              min="8"
              max="48"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="bcu-font-size"
              title="Font Size"
            />
          </div>

          <div className="bcu-tool-group">
            <button className="bcu-tool-btn" onClick={clearCanvas} title="Clear Canvas">
              <Trash2 size={20} />
            </button>
            <button className="bcu-tool-btn" onClick={downloadWireframe} title="Download">
              <Download size={20} />
            </button>
            <label className="bcu-tool-btn" title="Upload Wireframe">
              <Upload size={20} />
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        <div className="bcu-canvas-container">
          <canvas
            ref={canvasRef}
            className="bcu-wireframe-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{
              border: '2px solid var(--bcu-gray-200)',
              borderRadius: 'var(--bcu-radius-md)',
              cursor: currentTool === 'select' ? 'default' : 'crosshair'
            }}
          />
        </div>

        {showTextInput && (
          <div className="bcu-text-input-modal">
            <div className="bcu-text-input-content">
              <h3>Add Text</h3>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text..."
                className="bcu-input"
                autoFocus
              />
              <div className="bcu-text-input-actions">
                <button className="bcu-button bcu-button-outline" onClick={() => setShowTextInput(false)}>
                  Cancel
                </button>
                <button className="bcu-button bcu-button-primary" onClick={addText}>
                  Add Text
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bcu-wireframe-info">
          <div className="bcu-info-card">
            <h3>Wireframe Elements</h3>
            <p>Total: {elements.length}</p>
            <p>Selected: {selectedElement ? '1' : '0'}</p>
            {selectedElement && (
              <button 
                className="bcu-button bcu-button-danger" 
                onClick={deleteSelected}
                style={{ marginTop: 'var(--bcu-spacing-3)' }}
              >
                Delete Selected
              </button>
            )}
          </div>

          <div className="bcu-info-card">
            <h3>Export Options</h3>
            <p>Save your wireframe as JSON to use in the Design Generator</p>
            <button 
              className="bcu-button bcu-button-primary" 
              onClick={() => {
                const data = exportWireframe();
                localStorage.setItem('bcu-wireframe-data', JSON.stringify(data));
                alert('Wireframe saved! You can now use it in the Design Generator.');
              }}
            >
              Save for Design Generator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WireframeEditor;
