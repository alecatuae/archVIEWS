import React, { useState } from 'react';
import { FunnelIcon, AdjustmentsHorizontalIcon, ArrowsPointingOutIcon, ArrowPathIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

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
  onGroupByCategory?: (enabled: boolean) => void;
  layoutOptions?: {
    name: string;
    label: string;
  }[];
  onChangeLayout?: (layoutName: string) => void;
}

const GraphControls: React.FC<GraphControlsProps> = ({
  nodeCategories,
  relationshipTypes,
  onNodeCategoryFilter,
  onRelationshipFilter,
  onZoomToFit,
  onResetLayout,
  onGroupByCategory,
  layoutOptions = [
    { name: 'cola', label: 'Force-Directed' },
    { name: 'circle', label: 'Circle' },
    { name: 'grid', label: 'Grid' },
    { name: 'concentric', label: 'Concentric' }
  ],
  onChangeLayout
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [selectedNodeCategories, setSelectedNodeCategories] = useState<string[]>([]);
  const [selectedRelationships, setSelectedRelationships] = useState<string[]>([]);
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [currentLayout, setCurrentLayout] = useState('cola');

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
    if (isLayoutOpen) setIsLayoutOpen(false);
  };

  const toggleLayout = () => {
    setIsLayoutOpen(!isLayoutOpen);
    if (isFilterOpen) setIsFilterOpen(false);
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

  const toggleGroupByCategory = () => {
    const newValue = !groupByCategory;
    setGroupByCategory(newValue);
    if (onGroupByCategory) {
      onGroupByCategory(newValue);
    }
  };

  const handleLayoutChange = (layoutName: string) => {
    setCurrentLayout(layoutName);
    if (onChangeLayout) {
      onChangeLayout(layoutName);
    }
    setIsLayoutOpen(false);
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
            onClick={toggleLayout}
            className={`px-3 py-2 rounded-md flex items-center ${
              isLayoutOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Squares2X2Icon className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Layout</span>
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
        
        <div className="flex items-center">
          {onGroupByCategory && (
            <div className="mr-3">
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={groupByCategory}
                  onChange={toggleGroupByCategory}
                />
                <div className="relative w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-2 text-xs text-gray-700">Group by Category</span>
              </label>
            </div>
          )}
          
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
      
      {isLayoutOpen && onChangeLayout && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200">
          <h3 className="font-medium text-sm mb-3">Layout Options</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {layoutOptions.map((option) => (
              <button
                key={option.name}
                onClick={() => handleLayoutChange(option.name)}
                className={`p-2 rounded text-sm ${
                  currentLayout === option.name
                    ? 'bg-blue-100 text-blue-600 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphControls; 