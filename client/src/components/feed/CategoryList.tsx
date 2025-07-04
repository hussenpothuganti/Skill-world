import React from "react";

// Placeholder for CategoryList component
interface CategoryListProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ 
  selectedCategory, 
  onSelectCategory 
}) => {
  // Mock categories
  const categories = ["All", "Music", "Dance", "Art", "Photography", "Cooking", "Sports", "Technology", "Writing", "Languages", "Fitness"];
  
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-2">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              selectedCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
            onClick={() => onSelectCategory(category)}
            aria-pressed={selectedCategory === category}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
