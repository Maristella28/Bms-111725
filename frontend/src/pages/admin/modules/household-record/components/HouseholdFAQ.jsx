import React, { useState } from 'react';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  QuestionMarkCircleIcon,
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  TagIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const HouseholdFAQ = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState(new Set());

  const categories = [
    { id: 'all', name: 'All Categories', icon: QuestionMarkCircleIcon },
    { id: 'general', name: 'General', icon: HomeIcon },
    { id: 'management', name: 'Management', icon: UserGroupIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'search', name: 'Search & Filter', icon: CogIcon },
    { id: 'export', name: 'Export', icon: DocumentArrowDownIcon },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: ExclamationTriangleIcon }
  ];

  const faqItems = [
    {
      id: 1,
      question: "What is a household record?",
      answer: "A household record represents a family unit in the community, containing information about the household head, family size, demographics, and contact details. It helps track family composition and community structure.",
      category: "general",
      tags: ["household", "family", "definition"]
    },
    {
      id: 2,
      question: "How do I create a new household?",
      answer: "Click the 'Create Household' button, select a resident to serve as household head (or enter a name manually), set the household size, add contact information if available, and click 'Save Changes'.",
      category: "management",
      tags: ["create", "new", "household"]
    },
    {
      id: 3,
      question: "What information is required to create a household?",
      answer: "Minimum requirements include household size (number of members) and either a household head assignment or manual name entry. Contact information is optional but recommended for better communication.",
      category: "general",
      tags: ["requirements", "mandatory", "fields"]
    },
    {
      id: 4,
      question: "Can I change the household head after creation?",
      answer: "Yes, you can edit any household record and reassign the household head by selecting a different resident from the dropdown list or entering a new name manually.",
      category: "management",
      tags: ["edit", "change", "household head"]
    },
    {
      id: 5,
      question: "How do I search for specific households?",
      answer: "Use the search bar to find households by household ID, household head name, or address. The search is real-time and will filter results as you type.",
      category: "search",
      tags: ["search", "find", "filter"]
    },
    {
      id: 6,
      question: "What filters are available?",
      answer: "You can filter households by household size, demographics, and other criteria. Use the filter button to access advanced filtering options and clear filters to reset the view.",
      category: "search",
      tags: ["filter", "criteria", "options"]
    },
    {
      id: 7,
      question: "What analytics are available in the dashboard?",
      answer: "The analytics dashboard shows total households, total members, average household size, coverage rate, and demographic distribution including age, civil status, and gender breakdowns.",
      category: "analytics",
      tags: ["analytics", "dashboard", "statistics"]
    },
    {
      id: 8,
      question: "How is the average household size calculated?",
      answer: "The average household size is calculated by dividing the total number of community members by the total number of households, giving you the mean family size in your community.",
      category: "analytics",
      tags: ["calculation", "average", "household size"]
    },
    {
      id: 9,
      question: "What is the coverage rate?",
      answer: "The coverage rate shows what percentage of your target households have been registered in the system. It helps track how comprehensive your household data collection is.",
      category: "analytics",
      tags: ["coverage", "percentage", "target"]
    },
    {
      id: 10,
      question: "Can I export household data?",
      answer: "Yes, you can export household records for analysis and reporting. The export functionality allows you to download data in various formats for use in other systems or for offline analysis.",
      category: "export",
      tags: ["export", "download", "data"]
    },
    {
      id: 11,
      question: "How do I assign a resident as household head?",
      answer: "When creating or editing a household, use the resident search dropdown to find and select an existing resident. The system will automatically populate their information as the household head.",
      category: "management",
      tags: ["assign", "resident", "household head"]
    },
    {
      id: 12,
      question: "What if a resident doesn't appear in the dropdown?",
      answer: "If a resident doesn't appear, they may not exist in the residents database. Check the residents module to ensure the person is properly registered, or you can enter their name manually.",
      category: "troubleshooting",
      tags: ["resident", "missing", "dropdown"]
    },
    {
      id: 13,
      question: "How do I update household size?",
      answer: "Edit the household record and change the household size field. This is useful when family composition changes due to births, deaths, or members moving in/out.",
      category: "management",
      tags: ["update", "household size", "family changes"]
    },
    {
      id: 14,
      question: "Can I delete household records?",
      answer: "Household records can typically be edited but deletion should be done carefully as it may affect related data. Contact your system administrator for guidance on record deletion.",
      category: "management",
      tags: ["delete", "remove", "records"]
    },
    {
      id: 15,
      question: "What does 'household head' mean?",
      answer: "The household head is typically the primary decision-maker or main contact person for the family unit. This is usually an adult family member who represents the household in official matters.",
      category: "general",
      tags: ["household head", "definition", "role"]
    },
    {
      id: 16,
      question: "How often should I update household information?",
      answer: "Update household information whenever there are changes in family composition, contact details, or household head. Regular updates ensure accurate demographic data and effective communication.",
      category: "management",
      tags: ["update", "frequency", "maintenance"]
    },
    {
      id: 17,
      question: "What if I can't find a household in search?",
      answer: "Try different search terms, check spelling, or clear filters. If the household should exist, verify it was properly saved and check for any data entry errors.",
      category: "troubleshooting",
      tags: ["search", "not found", "missing"]
    },
    {
      id: 18,
      question: "How do I view detailed household information?",
      answer: "Click on any household record in the table to expand and view detailed information including household details, member information, and contact data.",
      category: "general",
      tags: ["view", "details", "information"]
    },
    {
      id: 19,
      question: "Can I bulk import household data?",
      answer: "Bulk import functionality may be available depending on your system configuration. Contact your system administrator for information about importing large datasets.",
      category: "export",
      tags: ["bulk", "import", "data"]
    },
    {
      id: 20,
      question: "What happens if I enter invalid household size?",
      answer: "The system validates household size and will show an error if you enter invalid values (like negative numbers or zero). Household size must be a positive integer.",
      category: "troubleshooting",
      tags: ["validation", "error", "household size"]
    },
    {
      id: 21,
      question: "How do I handle duplicate household records?",
      answer: "If you discover duplicate records, contact your system administrator to merge or remove duplicates. Avoid creating multiple records for the same household.",
      category: "troubleshooting",
      tags: ["duplicate", "merge", "records"]
    },
    {
      id: 22,
      question: "Can I track household changes over time?",
      answer: "The system maintains current household information. Historical tracking may be available through audit logs or reporting features, depending on your system configuration.",
      category: "analytics",
      tags: ["tracking", "history", "changes"]
    },
    {
      id: 23,
      question: "What's the difference between household and resident records?",
      answer: "Household records represent family units, while resident records represent individual people. Residents can be assigned to households, and households have household heads who are residents.",
      category: "general",
      tags: ["difference", "household", "resident"]
    },
    {
      id: 24,
      question: "How do I ensure data accuracy?",
      answer: "Regularly verify information with household members, update records when changes occur, use validation features, and conduct periodic data audits to maintain accuracy.",
      category: "management",
      tags: ["accuracy", "verification", "maintenance"]
    }
  ];

  const filteredItems = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
          <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <QuestionMarkCircleIcon className="w-6 h-6 text-white" />
              </div>
            <div>
                <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
                <p className="text-white/80 text-sm">Find answers to common household management questions</p>
            </div>
          </div>
          <button
            onClick={onClose}
              className="text-white hover:text-red-200 transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search FAQ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
                <FunnelIcon className="w-4 h-4 mr-2" />
                Categories
              </h3>
              <nav className="space-y-1">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const count = faqItems.filter(item => 
                    category.id === 'all' || item.category === category.id
                  ).length;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span>{category.name}</span>
                      </div>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedCategory === 'all' ? 'All Questions' : categories.find(c => c.id === selectedCategory)?.name}
                      </h3>
              <p className="text-gray-600 text-sm">
                {filteredItems.length} question{filteredItems.length !== 1 ? 's' : ''} found
              </p>
                    </div>
                    
                    <div className="space-y-3">
              {filteredItems.map((item) => {
                        const isExpanded = expandedItems.has(item.id);
                const categoryInfo = categories.find(c => c.id === item.category);
                
                        return (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <button
                      onClick={() => toggleExpanded(item.id)}
                      className="w-full px-4 py-4 text-left hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              {categoryInfo?.name}
                            </span>
                            <div className="flex space-x-1">
                              {item.tags.slice(0, 3).map((tag, index) => (
                                <span key={index} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <h4 className="font-medium text-gray-900 text-sm mb-1">{item.question}</h4>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                              {isExpanded ? (
                            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                              ) : (
                            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                              )}
                        </div>
                      </div>
                            </button>
                            
                            {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="pt-4">
                          <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                        </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <QuestionMarkCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                <p className="text-gray-600 text-sm">
                  Try adjusting your search terms or selecting a different category.
                </p>
                  </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseholdFAQ;
