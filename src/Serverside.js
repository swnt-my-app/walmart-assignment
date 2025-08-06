import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import './App.css';

const PAGE_SIZE = 10;

const LazyTableBody = lazy(() => import('./TableBody'));

const Serverside = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observer = useRef();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        query: debouncedQuery,
        offset,
        limit: PAGE_SIZE
      });
      const res = await fetch(`https://search-api-backend-production.up.railway.app/api/items?${params.toString()}`);
      const data = await res.json();

      if (data.length < PAGE_SIZE) setHasMore(false);
      setItems(prev => [...prev, ...data]);
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, offset]);

  useEffect(() => {
    setItems([]);
    setOffset(0);
    setHasMore(true);
  }, [debouncedQuery]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const lastItemRef = useCallback(
    node => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          setOffset(prev => prev + PAGE_SIZE);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  return (
    <div className="App">
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ marginBottom: '10px', padding: '8px', width: '250px' }}
      />

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Price ($)</th>
            </tr>
          </thead>
          <Suspense fallback={<tr><td colSpan="3">Loading rows...</td></tr>}>
            <LazyTableBody items={items} lastItemRef={lastItemRef} />
          </Suspense>
        </table>

        {loading && <div className="spinner"></div>}
        {!loading && !hasMore && <p>No more items to load.</p>}
      </div>
    </div>
  );
};

export default Serverside;