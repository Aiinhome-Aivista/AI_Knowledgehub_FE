import { useEffect, useRef, useState } from 'react';

interface ViewerGraphProps {
  theme: 'light' | 'dark';
}

const ViewerGraph: React.FC<ViewerGraphProps> = ({ theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visLoaded, setVisLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const networkRef = useRef<any>(null);

  // Dynamically load vis-network script on mount
  useEffect(() => {
    if ((window as any).vis) {
      setVisLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/vis-network/standalone/umd/vis-network.min.js';
    script.async = true;
    script.onload = () => setVisLoaded(true);
    script.onerror = () => setError('Failed to load Graph Visualization library.');
    document.head.appendChild(script);
  }, []);

  // Fetch graph data and mount Network
  useEffect(() => {
    if (!visLoaded || !containerRef.current) return;

    setLoading(true);
    setError(null);

    fetch('http://localhost:5000/api/graph-data')
      .then(response => response.json())
      .then(data => {
        setLoading(false);
        if (!data.nodes || data.nodes.length === 0) {
          setError("Knowledge Graph is empty. Scrape RSS feeds to extract graph entities.");
          return;
        }

        const vis = (window as any).vis;

        // Custom theme mapping on node styles
        const themedNodes = data.nodes.map((node: any) => {
          const isArticle = node.shape === 'square';
          
          if (theme === 'light') {
            return {
              ...node,
              color: isArticle 
                ? { background: '#f8fafc', border: '#ea580c', highlight: { background: '#f1f5f9', border: '#ea580c' } }
                : node.color,
              font: {
                ...node.font,
                color: isArticle ? '#ea580c' : '#334155',
                strokeWidth: 2,
                strokeColor: '#ffffff'
              }
            };
          } else {
            return {
              ...node,
              color: isArticle
                ? { background: '#111827', border: '#fb923c', highlight: { background: '#030712', border: '#fb923c' } }
                : node.color,
              font: {
                ...node.font,
                color: isArticle ? '#fb923c' : '#e2e8f0',
                strokeWidth: 0
              }
            };
          }
        });

        const themedEdges = data.edges.map((edge: any) => {
          return {
            ...edge,
            color: {
              color: theme === 'light' ? '#cbd5e1' : '#334155',
              highlight: theme === 'light' ? '#4f46e5' : '#fb923c'
            },
            font: {
              ...edge.font,
              color: theme === 'light' ? '#64748b' : '#94a3b8',
              background: theme === 'light' ? '#ffffff' : '#0b0f19'
            }
          };
        });

        const graphData = {
          nodes: new vis.DataSet(themedNodes),
          edges: new vis.DataSet(themedEdges)
        };

        const options = {
          nodes: {
            shape: 'dot',
            size: 16,
            font: {
              size: 13,
              face: 'Inter, ui-sans-serif, system-ui'
            },
            borderWidth: 2
          },
          edges: {
            width: 1.5,
            arrows: {
              to: { enabled: true, scaleFactor: 0.8 }
            },
            smooth: { type: 'continuous' }
          },
          physics: {
            barnesHut: {
              gravitationalConstant: -3500,
              centralGravity: 0.05,
              springLength: 180,
              springConstant: 0.04,
              damping: 0.09
            },
            stabilization: { iterations: 120 }
          }
        };

        // Initialize network
        if (networkRef.current) {
          networkRef.current.destroy();
        }
        networkRef.current = new vis.Network(containerRef.current, graphData, options);
      })
      .catch(err => {
        setLoading(false);
        setError("Could not connect to backend to retrieve graph database.");
        console.error(err);
      });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [visLoaded, theme]);

  return (
    <div className="space-y-6 w-full h-full flex flex-col animate-in fade-in duration-300 p-4 md:p-6">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold theme-text-primary">Knowledge Graph</h2>
          <p className="text-sm theme-text-secondary mt-1">Read-only interactive visualization mapping article nodes and entities from ArangoDB</p>
        </div>
      </div>

      {/* Network Canvas Container */}
      <div className="flex-1 rounded-2xl border relative overflow-hidden theme-card-bg theme-border min-h-[400px] shadow-sm">
        {loading && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-slate-900/10 backdrop-blur-xs z-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs theme-text-secondary mt-3">Drawing Graph relationships...</span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col justify-center items-center p-8 text-center z-20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm theme-text-primary font-medium">{error}</p>
            <p className="text-xs theme-text-secondary mt-1">Drag canvas to pan. Use scroll wheel to zoom.</p>
          </div>
        )}

        {/* Network Mount Point */}
        <div 
          ref={containerRef} 
          className="w-full h-full"
          style={{ background: theme === 'light' ? '#ffffff' : '#0b0f19' }}
        ></div>
      </div>
    </div>
  );
};

export default ViewerGraph;
