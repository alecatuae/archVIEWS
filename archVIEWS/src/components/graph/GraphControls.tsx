import React, { useState } from 'react';
import { FunnelIcon, AdjustmentsHorizontalIcon, ArrowsPointingOutIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface CategoryFilterOption {
  id: string;
  label: string;
  color: string;
}

interface RelationshipFilterOption {
  id: string;
  label: string;
  color: string;
}

interface GraphControlsProps {
  nodeCategories: CategoryFilterOption[];
  relationshipTypes: RelationshipFilterOption[];
  onNodeCategoryFilter: (selectedCategories: string[]) => void;
  onRelationshipFilter: (selectedRelationships: string[]) => void;
  onZoomToFit: () => void;
  onResetLayout: () => void;
}

const GraphControls: React.FC<GraphControlsProps> = ({
  nodeCategories,
  relationshipTypes,
  onNodeCategoryFilter,
  onRelationshipFilter,
  onZoomToFit,
  onResetLayout
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedNodeCategories, setSelectedNodeCategories] = useState<string[]>([]);
  const [selectedRelationships, setSelectedRelationships] = useState<string[]>([]);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleCategoryChange = (categoryId: string) => {
    const updatedCategories = selectedNodeCategories.includes(categoryId)
      ? selectedNodeCategories.filter(id => id !== categoryId)
      : [...selectedNodeCategories, categoryId];
    
    setSelectedNodeCategories(updatedCategories);
    onNodeCategoryFilter(updatedCategories);
  };

  const handleRelationshipChange = (relationshipId: string) => {
    const updatedRelationships = selectedRelationships.includes(relationshipId)
      ? selectedRelationships.filter(id => id !== relationshipId)
      : [...selectedRelationships, relationshipId];
    
    setSelectedRelationships(updatedRelationships);
    onRelationshipFilter(updatedRelationships);
  };

  const selectAllCategories = () => {
    const allCategoryIds = nodeCategories.map(cat => cat.id);
    setSelectedNodeCategories(allCategoryIds);
    onNodeCategoryFilter(allCategoryIds);
  };

  const selectAllRelationships = () => {
    const allRelationshipIds = relationshipTypes.map(rel => rel.id);
    setSelectedRelationships(allRelationshipIds);
    onRelationshipFilter(allRelationshipIds);
  };

  const clearAllCategories = () => {
    setSelectedNodeCategories([]);
    onNodeCategoryFilter([]);
  };

  const clearAllRelationships = () => {
    setSelectedRelationships([]);
    onRelationshipFilter([]);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <div className="flex space-x-1">
          <button
            onClick={toggleFilter}
            className={`px-3 py-2 rounded-md flex items-center ${
              isFilterOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <FunnelIcon className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Filters</span>
          </button>
          
          <button
            onClick={onZoomToFit}
            className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center"
            title="Fit to Screen"
          >
            <ArrowsPointingOutIcon className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Fit</span>
          </button>
          
          <button
            onClick={onResetLayout}
            className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center"
            title="Reset Layout"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Reset</span>
          </button>
        </div>
        
        <div>
          <span className="text-xs text-gray-500">
            {`${nodeCategories.length} types · ${relationshipTypes.length} relationships`}
          </span>
        </div>
      </div>

      {isFilterOpen && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-sm flex items-center">
                <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1 text-gray-500" />
                Node Categories
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={selectAllCategories}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
                <button
                  onClick={clearAllCategories}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              {nodeCategories.map((category) => (
                <div key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`category-${category.id}`}
                    checked={selectedNodeCategories.includes(category.id) || selectedNodeCategories.length === 0}
                    onChange={() => handleCategoryChange(category.id)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="ml-2 text-sm text-gray-700 flex items-center"
                  >
                    <span 
                      className="w-3 h-3 rounded-full mr-1" 
                      style={{ backgroundColor: category.color }}
                    ></span>
                    {category.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-sm flex items-center">
                <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1 text-gray-500" />
                Relationship Types
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={selectAllRelationships}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
                <button
                  onClick={clearAllRelationships}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              {relationshipTypes.map((relationship) => (
                <div key={relationship.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`relationship-${relationship.id}`}
                    checked={selectedRelationships.includes(relationship.id) || selectedRelationships.length === 0}
                    onChange={() => handleRelationshipChange(relationship.id)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label
                    htmlFor={`relationship-${relationship.id}`}
                    className="ml-2 text-sm text-gray-700 flex items-center"
                  >
                    <span 
                      className="w-3 h-3 rounded-full mr-1" 
                      style={{ backgroundColor: relationship.color }}
                    ></span>
                    {relationship.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphControls; 