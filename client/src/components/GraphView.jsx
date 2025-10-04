import React from 'react';
import ForceGraph2D from 'react-force-graph-2d';

function GraphView({ papers }) {
  // Transform papers into graph data
  const graphData = {
    nodes: papers.map(p => ({
      id: p._id,
      name: p.title
    })),
    links: [] // TODO: Add paper relationships based on tags/authors
  };

  return (
    <div className="graph-view">
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="name"
        nodeAutoColorBy="id"
      />
    </div>
  );
}

export default GraphView;