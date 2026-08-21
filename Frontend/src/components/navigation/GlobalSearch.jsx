import React, { useState, useEffect, useRef } from 'react';
import { searchService } from '../../services/searchService';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = ({ workspaceId }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ tasks: [], projects: [], members: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length >= 2 && workspaceId) {
        setLoading(true);
        try {
          const res = await searchService.globalSearch(query, workspaceId);
          setResults(res.data);
          setIsOpen(true);
        } catch (error) {
          console.error("Search error", error);
        } finally {
          setLoading(false);
        }
      } else {
        setIsOpen(false);
        setResults({ tasks: [], projects: [], members: [] });
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query, workspaceId]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-md px-3 py-1.5 w-36 sm:w-64 md:w-96 focus-within:ring-2 ring-indigo-500">
        <Search className="w-4 h-4 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search tasks, projects..."
          className="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-200"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.length >= 2) setIsOpen(true) }}
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 shadow-xl rounded-md border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
          ) : (
            <div className="py-2">
              {results.tasks.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tasks</div>
                  {results.tasks.map(task => (
                    <div key={task._id} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                         onClick={() => { setIsOpen(false); navigate(`/projects/${task.projectId}`); }}>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.status}</p>
                    </div>
                  ))}
                </div>
              )}
              {results.projects.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Projects</div>
                  {results.projects.map(proj => (
                    <div key={proj._id} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                         onClick={() => { setIsOpen(false); navigate(`/projects/${proj._id}`); }}>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{proj.name}</p>
                      <p className="text-xs text-gray-500">{proj.key}</p>
                    </div>
                  ))}
                </div>
              )}
              {results.members.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Members</div>
                  {results.members.map(member => (
                    <div key={member._id} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2 text-xs font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {results.tasks.length === 0 && results.projects.length === 0 && results.members.length === 0 && (
                <div className="p-4 text-center text-sm text-gray-500">No results found.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
