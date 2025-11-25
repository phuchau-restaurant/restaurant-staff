import React, { useState } from "react";
import { Plus } from "lucide-react";
import FoodForm from "../../components/Dashboard/FoodForm";


const InventoryContent = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'form'
  const [editingFood, setEditingFood] = useState(null);

  const [categories, setCategories] = useState([
    { id: "snack", name: "Snack", image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400" },
    { id: "meal", name: "Meal", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400" },
    { id: "vegan", name: "Vegan", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400" },
    { id: "dessert", name: "Dessert", image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400" },
    { id: "drink", name: "Drink", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400" },
    { id: "appetizer", name: "Appetizer", image: "https://images.unsplash.com/photo-1541529086526-db283c563270?w=400" },
    { id: "soup", name: "Soup", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400" },
  ]);

  const [foods, setFoods] = useState([
    { id: 1, name: "Burger Deluxe", category: "Meal", price: "$12.99", description: "Premium burger with cheese", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" },
    { id: 2, name: "Caesar Salad", category: "Vegan", price: "$8.99", description: "Fresh caesar salad", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400" },
    { id: 3, name: "Chocolate Cake", category: "Dessert", price: "$6.99", description: "Rich chocolate cake", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400" },
    { id: 4, name: "Fresh Juice", category: "Drink", price: "$4.99", description: "Freshly squeezed juice", image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400" },
    { id: 5, name: "French Fries", category: "Snack", price: "$3.99", description: "Crispy french fries", image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400" },
    { id: 6, name: "Pizza Margherita", category: "Meal", price: "$14.99", description: "Classic margherita pizza", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400" },
    { id: 7, name: "Green Smoothie", category: "Drink", price: "$5.99", description: "Healthy green smoothie", image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400" },
    { id: 8, name: "Ice Cream", category: "Dessert", price: "$4.99", description: "Creamy ice cream", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400" },
  ]);

  const handleAddFood = (foodData) => {
    // Check if new category needs to be added
    if (foodData.category && !categories.find(cat => cat.name.toLowerCase() === foodData.category.toLowerCase())) {
      const newCategory = {
        id: foodData.category.toLowerCase().replace(/\s+/g, '-'),
        name: foodData.category
      };
      setCategories([...categories, newCategory]);
    }

    const foodToAdd = {
      ...foodData,
      id: foods.length + 1,
    };
    setFoods([...foods, foodToAdd]);
    setViewMode('list');
  };

  const handleUpdateFood = (foodData) => {
    // Check if new category needs to be added
    if (foodData.category && !categories.find(cat => cat.name.toLowerCase() === foodData.category.toLowerCase())) {
      const newCategory = {
        id: foodData.category.toLowerCase().replace(/\s+/g, '-'),
        name: foodData.category
      };
      setCategories([...categories, newCategory]);
    }

    const updatedFood = {
      ...editingFood,
      ...foodData,
    };

    setFoods(foods.map(food => food.id === updatedFood.id ? updatedFood : food));
    setViewMode('list');
    setEditingFood(null);
  };

  const handleEditClick = (food, e) => {
    e.stopPropagation();
    setEditingFood(food);
    setViewMode('form');
  };

  const handleCloseForm = () => {
    setViewMode('list');
    setEditingFood(null);
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gray-100">
        <div className="px-8 pt-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Inventory Management
          </h2>
          {viewMode === 'list' && (
            <>
              <p className="text-sm text-gray-500 mt-1">
                Manage your food items and categories
              </p>
              <button 
                onClick={() => {
                  setEditingFood(null);
                  setViewMode('form');
                }}
                className="group flex items-center gap-2 mt-4 py-2 text-black font-semibold text-sm hover:underline transition-colors curson-pointer"
              >
                <div className="bg-orange-500 rounded-full flex items-center justify-center p-1 group-hover:bg-orange-600 transition-colors">
                  <Plus className="text-white" size={22} />
                </div>
                Add New
              </button>
            </>
          )}
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-gray-100 px-8 py-6 min-h-screen">
          {/* Categories Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-700">Categories</h2>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="flex gap-10">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`group relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all shrink-0 w-60 h-70 ${
                      selectedCategory === category.id ? "ring-4 ring-orange-500" : ""
                    }`}
                  >
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <div className="w-20 h-20 bg-gray-400 rounded-lg"></div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 py-2">
                      <p className="text-center font-semibold text-gray-800 text-sm">
                        {category.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* All Foods Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-700">All Foods</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {foods.map((food) => (
                <div
                  key={food.id}
                   className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all"
                >
                  {food.image ? (
                    <div className="w-full overflow-hidden">
                      <img
                        src={food.image}
                        alt={food.name}
                        className="w-full h-48 object-cover object-center rounded-2xl"
                      />
                    </div>
                  ) : (
                    <div className="w-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <div className="w-28 h-28 bg-gray-400 rounded-lg"></div>
                    </div>
                  )}
                  <div className="px-3 pb-5">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {food.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {food.description}
                    </p>
                  </div>

                 <div className="flex items-center justify-between mt-2 px-4 py-3">
                      <p className="text-orange-600 font-bold text-2xl font-smooch-sans">
                        {food.price}
                      </p>
                      <button
                        onClick={(e) => handleEditClick(food, e)}
                        className="text-[15px] text-gray-400 hover:text-blue-700 font-oswald underline"
                        
                      >
                        Edit info
                      </button>
                    </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form View */}
      {viewMode === 'form' && (
        <FoodForm 
          mode={editingFood ? "edit" : "add"}
          food={editingFood}
          categories={categories}
          onSubmit={editingFood ? handleUpdateFood : handleAddFood}
          onClose={handleCloseForm}
        />
      )}
    </>
  );
};

export default InventoryContent;
