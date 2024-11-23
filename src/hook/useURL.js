import { useEffect } from 'react'
import useLocalStorage from './useLocalStorage'
import {KEY} from '../constants'


export default function useURLParams() {
  const [state, setState] = useLocalStorage(KEY.MAIN)
  const [query, setQuery] = useLocalStorage(KEY.QUERY)  
  
  
  useEffect(() => {
    const parseQueryString = (search) => {
      const query = {}
      // Remove the leading '?' if present
      const q = search.startsWith('?') ? search.slice(1) : search;
      
      if (!q) return query;
      
      try {
        q.split('&').forEach(param => {
          const [key, value] = param.split('=');
          if (key) {
            query[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
          }
        });
      } catch (error) {
        console.error('Error parsing query string:', error);
      }
      
      return query
    }
    
    
    const handleURLChange = () => {
      // Handle hash changes
      const hash = window.location.hash.slice(1);
      setState(hash)
      
      // Handle query string changes
      const queryString = window.location.search;
      const queryParams = parseQueryString(queryString);
      setQuery(queryParams)
    }
    
    
    // Listen for both hash changes and history changes
    window.addEventListener('hashchange', handleURLChange);
    window.addEventListener('popstate', handleURLChange);
    
    // Call once on mount to handle initial URL
    handleURLChange();
    
    return () => {
      window.removeEventListener('hashchange', handleURLChange);
      window.removeEventListener('popstate', handleURLChange);
    };
  }, []);
  
  
  return {
    setState, state,
    setQuery, query,
  }
}