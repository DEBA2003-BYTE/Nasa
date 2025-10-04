import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function PaperDetail() {
  const { id } = useParams();
  const [paper, setPaper] = useState(null);
  const [annotation, setAnnotation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaper();
  }, [id]);

  const fetchPaper = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/paper/${id}`);
      const data = await response.json();
      setPaper(data);
    } catch (error) {
      console.error('Error fetching paper:', error);
      alert('Error loading paper details');
    } finally {
      setLoading(false);
    }
  };

  const handleAnnotate = async (e) => {
    e.preventDefault();
    if (!annotation.trim()) return;

    try {
      const response = await fetch(`http://localhost:3000/api/paper/${id}/annotate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: annotation }),
      });
      const data = await response.json();
      setPaper(data);
      setAnnotation('');
    } catch (error) {
      console.error('Error adding annotation:', error);
      alert('Error adding annotation');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!paper) return <div>Paper not found</div>;

  return (
    <div>
      <h1>{paper.title}</h1>
      <p style={{ marginTop: '1rem' }}>Authors: {paper.authors.join(', ')}</p>
      
      {paper.url && (
        <p style={{ margin: '1rem 0' }}>
          <a href={paper.url} target="_blank" rel="noopener noreferrer">
            View Original Paper
          </a>
        </p>
      )}

      {paper.abstract && (
        <div style={{ margin: '1rem 0' }}>
          <h2>Abstract</h2>
          <p>{paper.abstract}</p>
        </div>
      )}

      {paper.tags.length > 0 && (
        <div style={{ margin: '1rem 0' }}>
          <h2>Tags</h2>
          <p>{paper.tags.join(', ')}</p>
        </div>
      )}

      <div style={{ margin: '2rem 0' }}>
        <h2>Annotations</h2>
        {paper.annotations.map((a, i) => (
          <div key={i} className="paper-card">
            <p>{a.text}</p>
            <small>Added: {new Date(a.createdAt).toLocaleDateString()}</small>
          </div>
        ))}

        <form onSubmit={handleAnnotate} style={{ marginTop: '1rem' }}>
          <textarea
            value={annotation}
            onChange={(e) => setAnnotation(e.target.value)}
            placeholder="Add an annotation..."
            style={{ width: '100%', minHeight: '100px', padding: '0.5rem' }}
          />
          <button type="submit" style={{ marginTop: '0.5rem' }}>
            Add Annotation
          </button>
        </form>
      </div>
    </div>
  );
}

export default PaperDetail;